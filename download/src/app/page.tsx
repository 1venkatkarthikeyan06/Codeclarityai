"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  generateCodeDocumentation
} from "@/ai/flows/generate-code-documentation";
import {
  suggestCodeRefactorings
} from "@/ai/flows/suggest-code-refactorings";
import {
  analyzeCodeComplexity
} from "@/ai/flows/analyze-code-complexity";
import {
  generateUnitTests
} from "@/ai/flows/generate-unit-tests";
import { Loader2, FileText, Wand2, Gauge, BrainCircuit, TestTubeDiagonal, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";

type Language = "C++" | "Python" | "JavaScript";

type AnalysisResults = {
  documentation: string;
  refactorings: string[];
  complexity: string;
  unitTests: string;
};

const defaultCode: Record<Language, string> = {
  JavaScript: `// A simple "Hello, World!" function in JavaScript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');`,
  Python: `# A simple "Hello, World!" function in Python
def greet(name):
    print(f"Hello, {name}!")

greet('World')`,
  "C++": `// A simple "Hello, World!" program in C++
#include <iostream>
#include <string>

void greet(const std::string& name) {
    std::cout << "Hello, " << name << "!" << std::endl;
}

int main() {
    greet("World");
    return 0;
}`,
};

const ResultSkeleton = () => (
  <div className="space-y-4 pt-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-full" />
  </div>
);

export default function CodeClarityPage() {
  const [language, setLanguage] = useState<Language>("JavaScript");
  const [code, setCode] = useState<string>(defaultCode["JavaScript"]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    setCode(defaultCode[value]);
    setResults(null);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Code input cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const languageForRefactor = language === 'JavaScript' ? 'JS' : language;
      
      const [doc, refactor, complex, tests] = await Promise.all([
        generateCodeDocumentation({ code, language }),
        suggestCodeRefactorings({ code, language: languageForRefactor }),
        analyzeCodeComplexity({ code, language }),
        generateUnitTests({ code, language }),
      ]);

      setResults({
        documentation: doc.documentation,
        refactorings: refactor.refactorings,
        complexity: complex.complexityAnalysis,
        unitTests: tests.unitTests,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results) return;

    const doc = new jsPDF();
    const margin = 10;
    let y = margin;

    const addWrappedText = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, startY);
      return startY + lines.length * lineHeight;
    };
    
    doc.setFontSize(18);
    doc.text("CodeClarity AI Analysis Report", margin, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("1. Documentation", margin, y);
    y += 8;
    doc.setFont("courier");
    doc.setFontSize(10);
    y = addWrappedText(results.documentation, margin, y, 180, 5);
    y += 10;
    
    doc.setFont("helvetica");
    doc.setFontSize(14);
    doc.text("2. Refactoring Suggestions", margin, y);
    y += 8;
    doc.setFontSize(11);
    results.refactorings.forEach(suggestion => {
        y = addWrappedText(`- ${suggestion}`, margin, y, 180, 6);
    });
    y += 10;
    
    doc.setFontSize(14);
    doc.text("3. Complexity Analysis", margin, y);
    y += 8;
    doc.setFont("courier");
    doc.setFontSize(10);
    y = addWrappedText(results.complexity, margin, y, 180, 5);
    y += 10;
    
    doc.setFont("helvetica");
    doc.setFontSize(14);
    doc.text("4. Unit Tests", margin, y);
    y += 8;
    doc.setFont("courier");
    doc.setFontSize(10);
    y = addWrappedText(results.unitTests, margin, y, 180, 5);
    
    doc.save("code-analysis-report.pdf");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="py-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <BrainCircuit className="h-12 w-12 text-primary"/>
          <h1 className="text-5xl font-bold tracking-tighter text-primary">
            CodeClarity AI
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Instant documentation, refactoring, and complexity analysis for your code.
        </p>
      </header>

      <main className="grid lg:grid-cols-2 gap-8 items-start">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Input Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={handleLanguageChange} value={language}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Paste your code here"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Code"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Analysis Results</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!results || isLoading}
            >
              <Download className="mr-2" />
              Download Report
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="documentation" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="documentation"><FileText className="mr-2"/>Documentation</TabsTrigger>
                <TabsTrigger value="refactoring"><Wand2 className="mr-2"/>Refactoring</TabsTrigger>
                <TabsTrigger value="complexity"><Gauge className="mr-2"/>Complexity</TabsTrigger>
                <TabsTrigger value="tests"><TestTubeDiagonal className="mr-2"/>Tests</TabsTrigger>
              </TabsList>
              
              <div className="min-h-[400px] pt-4">
                {isLoading && <ResultSkeleton />}
                
                {results && !isLoading && (
                  <div className="animate-in fade-in-50 duration-500">
                    <TabsContent value="documentation">
                      <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-muted/50 text-foreground">
                        <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 m-0">{results.documentation}</pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="refactoring">
                      <ul className="space-y-4">
                        {results.refactorings.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-4 p-4 rounded-md border bg-muted/50">
                            <div className="flex-shrink-0 mt-1">
                              <Wand2 className="h-5 w-5 text-accent" />
                            </div>
                            <p className="text-sm text-foreground">{suggestion}</p>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="complexity">
                      <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-muted/50 text-foreground">
                        <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 m-0">{results.complexity}</pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="tests">
                      <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-muted/50 text-foreground">
                        <pre className="whitespace-pre-wrap font-mono bg-transparent p-0 m-0 text-sm">{results.unitTests}</pre>
                      </div>
                    </TabsContent>
                  </div>
                )}
                {!isLoading && !results && (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                     <p>Your analysis results will appear here.</p>
                     <p className="text-sm">Enter your code and click "Analyze Code" to get started.</p>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

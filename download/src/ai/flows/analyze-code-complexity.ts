'use server';

/**
 * @fileOverview An AI agent that analyzes code complexity and provides Big O notation.
 *
 * - analyzeCodeComplexity - A function that analyzes code complexity.
 * - AnalyzeCodeComplexityInput - The input type for the analyzeCodeComplexity function.
 * - AnalyzeCodeComplexityOutput - The return type for the analyzeCodeComplexity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCodeComplexityInputSchema = z.object({
  code: z.string().describe('The code to analyze.'),
  language: z.enum(['C++', 'Python', 'JavaScript']).describe('The programming language of the code.'),
});
export type AnalyzeCodeComplexityInput = z.infer<typeof AnalyzeCodeComplexityInputSchema>;

const AnalyzeCodeComplexityOutputSchema = z.object({
  complexityAnalysis: z.string().describe('The algorithmic complexity (Big O notation) of the code.'),
});
export type AnalyzeCodeComplexityOutput = z.infer<typeof AnalyzeCodeComplexityOutputSchema>;

export async function analyzeCodeComplexity(input: AnalyzeCodeComplexityInput): Promise<AnalyzeCodeComplexityOutput> {
  return analyzeCodeComplexityFlow(input);
}

const analyzeCodeComplexityPrompt = ai.definePrompt({
  name: 'analyzeCodeComplexityPrompt',
  input: {schema: AnalyzeCodeComplexityInputSchema},
  output: {schema: AnalyzeCodeComplexityOutputSchema},
  prompt: `You are an expert software engineer specializing in code analysis.

  You will analyze the given code and determine its algorithmic complexity (Big O notation).
  Explain the complexity in a concise and clear manner.

  Language: {{{language}}}
  Code: {{{code}}}`,
});

const analyzeCodeComplexityFlow = ai.defineFlow(
  {
    name: 'analyzeCodeComplexityFlow',
    inputSchema: AnalyzeCodeComplexityInputSchema,
    outputSchema: AnalyzeCodeComplexityOutputSchema,
  },
  async input => {
    const {output} = await analyzeCodeComplexityPrompt(input);
    return output!;
  }
);

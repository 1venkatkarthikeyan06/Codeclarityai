'use server';

/**
 * @fileOverview A code documentation generator AI agent.
 *
 * - generateCodeDocumentation - A function that generates documentation for a given code snippet.
 * - GenerateCodeDocumentationInput - The input type for the generateCodeDocumentation function.
 * - GenerateCodeDocumentationOutput - The return type for the generateCodeDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeDocumentationInputSchema = z.object({
  code: z.string().describe('The code to be documented.'),
  language: z
    .enum(['C++', 'Python', 'JavaScript'])
    .describe('The programming language of the code.'),
});
export type GenerateCodeDocumentationInput = z.infer<
  typeof GenerateCodeDocumentationInputSchema
>;

const GenerateCodeDocumentationOutputSchema = z.object({
  documentation: z
    .string()
    .describe('The generated documentation for the code.'),
});
export type GenerateCodeDocumentationOutput = z.infer<
  typeof GenerateCodeDocumentationOutputSchema
>;

export async function generateCodeDocumentation(
  input: GenerateCodeDocumentationInput
): Promise<GenerateCodeDocumentationOutput> {
  return generateCodeDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeDocumentationPrompt',
  input: {schema: GenerateCodeDocumentationInputSchema},
  output: {schema: GenerateCodeDocumentationOutputSchema},
  prompt: `You are a senior software engineer whose primary job is to write documentation.

    You will generate documentation for the given code. Make sure to explain the code in detail.

    Language: {{{language}}}
    Code: {{{code}}} `,
});

const generateCodeDocumentationFlow = ai.defineFlow(
  {
    name: 'generateCodeDocumentationFlow',
    inputSchema: GenerateCodeDocumentationInputSchema,
    outputSchema: GenerateCodeDocumentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

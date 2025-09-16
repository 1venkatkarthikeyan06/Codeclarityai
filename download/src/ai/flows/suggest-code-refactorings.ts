'use server';

/**
 * @fileOverview Provides code refactoring suggestions using AI.
 *
 * - suggestCodeRefactorings - A function that suggests refactorings for the given code.
 * - SuggestCodeRefactoringsInput - The input type for the suggestCodeRefactorings function.
 * - SuggestCodeRefactoringsOutput - The return type for the suggestCodeRefactorings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCodeRefactoringsInputSchema = z.object({
  code: z.string().describe('The code to refactor.'),
  language: z.enum(['C++', 'Python', 'JS']).describe('The programming language of the code.'),
});
export type SuggestCodeRefactoringsInput = z.infer<
  typeof SuggestCodeRefactoringsInputSchema
>;

const SuggestCodeRefactoringsOutputSchema = z.object({
  refactorings: z
    .array(z.string())
    .describe('An array of refactoring suggestions for the code.'),
});
export type SuggestCodeRefactoringsOutput = z.infer<
  typeof SuggestCodeRefactoringsOutputSchema
>;

export async function suggestCodeRefactorings(
  input: SuggestCodeRefactoringsInput
): Promise<SuggestCodeRefactoringsOutput> {
  return suggestCodeRefactoringsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCodeRefactoringsPrompt',
  input: {schema: SuggestCodeRefactoringsInputSchema},
  output: {schema: SuggestCodeRefactoringsOutputSchema},
  prompt: `You are a code refactoring expert. Analyze the following code and provide refactoring suggestions to improve its readability, efficiency, and adherence to best practices.

Language: {{{language}}}
Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`

Refactoring Suggestions:`,
});

const suggestCodeRefactoringsFlow = ai.defineFlow(
  {
    name: 'suggestCodeRefactoringsFlow',
    inputSchema: SuggestCodeRefactoringsInputSchema,
    outputSchema: SuggestCodeRefactoringsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

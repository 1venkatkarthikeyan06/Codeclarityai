'use server';

/**
 * @fileOverview An AI agent that generates unit tests for code.
 *
 * - generateUnitTests - A function that generates unit tests for a given code snippet.
 * - GenerateUnitTestsInput - The input type for the generateUnitTests function.
 * - GenerateUnitTestsOutput - The return type for the generateUnitTests function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUnitTestsInputSchema = z.object({
  code: z.string().describe('The code to generate unit tests for.'),
  language: z
    .enum(['C++', 'Python', 'JavaScript'])
    .describe('The programming language of the code.'),
});
export type GenerateUnitTestsInput = z.infer<
  typeof GenerateUnitTestsInputSchema
>;

const GenerateUnitTestsOutputSchema = z.object({
  unitTests: z.string().describe('The generated unit tests for the code.'),
});
export type GenerateUnitTestsOutput = z.infer<
  typeof GenerateUnitTestsOutputSchema
>;

export async function generateUnitTests(
  input: GenerateUnitTestsInput
): Promise<GenerateUnitTestsOutput> {
  return generateUnitTestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUnitTestsPrompt',
  input: {schema: GenerateUnitTestsInputSchema},
  output: {schema: GenerateUnitTestsOutputSchema},
  prompt: `You are a software engineer who specializes in writing unit tests.

    You will generate unit tests for the given code.
    Use a common testing framework for the language (e.g., Jest for JavaScript, PyTest for Python, or Google Test for C++).
    Include tests for edge cases, normal inputs, and invalid inputs.
    The output should be only the code for the unit tests.

    Language: {{{language}}}
    Code:
    \`\`\`{{{language}}}
    {{{code}}}
    \`\`\`

    Unit Tests:`,
});

const generateUnitTestsFlow = ai.defineFlow(
  {
    name: 'generateUnitTestsFlow',
    inputSchema: GenerateUnitTestsInputSchema,
    outputSchema: GenerateUnitTestsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

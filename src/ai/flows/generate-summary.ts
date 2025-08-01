'use server';

/**
 * @fileOverview Generates a concise 4-6 point summary from lecture notes.
 *
 * - generateSummary - A function that generates the summary.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchTool } from '../tools/search';

const GenerateSummaryInputSchema = z.object({
  lectureNotes: z
    .string()
    .describe('The lecture notes to summarize.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise 4-6 point summary of the lecture notes.'),
    progress: z.string().describe('A short, one-sentence summary of the generation process.')
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryInputSchema},
  output: {schema: GenerateSummaryOutputSchema},
  tools: [searchTool],
  prompt: `You are an expert summarizer, skilled at extracting the most important information from lecture notes.

  Please provide a concise 4-6 point summary of the following lecture notes.

  If the provided text seems incomplete or too sparse, use the search tool to find more information about the topic to create a better summary.

  Lecture Notes: {{lectureNotes}}

  Ensure the summary is accurate, comprehensive, and easy to understand. Also respond with a one sentence progress indicator for the user.
  `,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Add a progress indicator to the output
    output!.progress = 'Generated a concise summary of the lecture notes.';
    return output!;
  }
);

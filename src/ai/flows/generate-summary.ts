
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
  studyLevel: z.string().optional().default('undergraduate').describe('The user\'s study level (e.g., high school, undergraduate, postgraduate).'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary paragraph of the lecture notes.'),
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
  prompt: `You are an expert summarizer, acting as a helpful tutor for a {{studyLevel}} student.
  Your goal is to extract the most important information from lecture notes and present it clearly.

  Please provide a concise summary of the following lecture notes as a single, well-written paragraph.
  Tailor the language, depth, and complexity of the summary to be appropriate for a {{studyLevel}} level.

  If the provided text seems incomplete or too sparse, use the search tool to find more information about the topic to create a better summary.

  Lecture Notes: {{lectureNotes}}

  Ensure the summary is accurate, comprehensive, and easy for a {{studyLevel}} student to understand. Also respond with a one sentence progress indicator for the user.
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

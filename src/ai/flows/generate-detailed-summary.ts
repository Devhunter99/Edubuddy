
'use server';

/**
 * @fileOverview Generates a detailed, point-form summary from lecture notes.
 *
 * - generateDetailedSummary - A function that generates the summary.
 * - GenerateDetailedSummaryInput - The input type for the generateDetailedSummary function.
 * - GenerateDetailedSummaryOutput - The return type for the generateDetailedSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchTool } from '../tools/search';
import type { GenerateSummaryInput } from './generate-summary';

export type GenerateDetailedSummaryInput = GenerateSummaryInput;

const GenerateDetailedSummaryOutputSchema = z.object({
  summary: z.array(z.string()).describe('A list of detailed points summarizing the text.'),
  progress: z.string().describe('A short, one-sentence summary of the generation process.'),
});
export type GenerateDetailedSummaryOutput = z.infer<typeof GenerateDetailedSummaryOutputSchema>;


export async function generateDetailedSummary(input: GenerateDetailedSummaryInput): Promise<GenerateDetailedSummaryOutput> {
  return generateDetailedSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedSummaryPrompt',
  input: {schema: z.object({
    lectureNotes: z.string(),
    studyLevel: z.string().optional(),
  })},
  output: {schema: GenerateDetailedSummaryOutputSchema},
  tools: [searchTool],
  prompt: `You are an expert summarizer, acting as a helpful tutor for a {{studyLevel}} student.
  Your goal is to extract the most important information from lecture notes and present it clearly in a detailed, point-form format.

  Please provide a detailed summary of the following lecture notes. Each key concept or piece of information should be a separate string in a JSON array.
  Tailor the language, depth, and complexity of the summary to be appropriate for a {{studyLevel}} level.

  If the provided text seems incomplete or too sparse, use the search tool to find more information about the topic to create a better summary.

  Lecture Notes: {{lectureNotes}}

  Ensure the summary is accurate, comprehensive, and easy for a {{studyLevel}} student to understand.
  The output should be a JSON object with a 'summary' field containing an array of strings, and a 'progress' field with a one-sentence progress indicator.
  `,
});

const generateDetailedSummaryFlow = ai.defineFlow(
  {
    name: 'generateDetailedSummaryFlow',
    inputSchema: z.object({
        lectureNotes: z.string(),
        studyLevel: z.string().optional(),
    }),
    outputSchema: GenerateDetailedSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Add a progress indicator to the output
    output!.progress = 'Generated a detailed point-form summary of the lecture notes.';
    return output!;
  }
);

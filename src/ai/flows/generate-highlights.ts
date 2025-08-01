
'use server';

/**
 * @fileOverview A flow to generate a list of highlights from input text.
 *
 * - generateHighlights - A function that handles the highlight generation process.
 * - GenerateHighlightsInput - The input type for the generateHighlights function.
 * - GenerateHighlightsOutput - The return type for the generateHighlights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHighlightsInputSchema = z.object({
  text: z.string().describe('The text to generate highlights from.'),
});
export type GenerateHighlightsInput = z.infer<typeof GenerateHighlightsInputSchema>;

const GenerateHighlightsOutputSchema = z.object({
  highlights: z.array(z.string()).describe('An array of up to 10 short, standout highlight points from the text.'),
});
export type GenerateHighlightsOutput = z.infer<typeof GenerateHighlightsOutputSchema>;

export async function generateHighlights(input: GenerateHighlightsInput): Promise<GenerateHighlightsOutput> {
  return generateHighlightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHighlightsPrompt',
  input: {schema: GenerateHighlightsInputSchema},
  output: {schema: GenerateHighlightsOutputSchema},
  prompt: `You are an expert in summarizing key information from text.

  From the following text, extract up to 10 short, important, standout points. These should be concise and easy to read quickly. Each point should be a single sentence.

  Text: {{{text}}}

  Format the output as a JSON object with a 'highlights' field containing an array of strings.
  `,
});

const generateHighlightsFlow = ai.defineFlow(
  {
    name: 'generateHighlightsFlow',
    inputSchema: GenerateHighlightsInputSchema,
    outputSchema: GenerateHighlightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

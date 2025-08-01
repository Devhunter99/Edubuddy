// src/ai/flows/generate-flashcards.ts
'use server';

/**
 * @fileOverview A flow to generate flashcards from input text.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchTool } from '../tools/search';

const GenerateFlashcardsInputSchema = z.object({
  text: z
    .string()
    .describe('The text to generate flashcards from.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe('The flashcard question, or a short important point.'),
      answer: z.string().describe('The flashcard answer, or an elaboration of the point.'),
    })
  ).describe('An array of flashcards or important points generated from the text.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  tools: [searchTool],
  prompt: `You are an expert in generating flashcards and summarizing key information from text.

  From the following text, either generate a few question-answer flashcards OR extract a few short, important, standout points.
  If you extract points, use the 'question' field for a short title or the point itself, and the 'answer' field for a brief elaboration.

  If the provided text seems incomplete or too sparse, use the search tool to find more information about the topic to create better flashcards.

  Text: {{{text}}}

  Format the output as a JSON array of objects, where each object has a "question" and an "answer" field.
  `,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

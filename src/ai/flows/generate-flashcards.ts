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

const GenerateFlashcardsInputSchema = z.object({
  text: z
    .string()
    .describe('The text to generate flashcards from.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe('The flashcard question.'),
      answer: z.string().describe('The flashcard answer.'),
    })
  ).describe('An array of flashcards generated from the text.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert in generating flashcards from text.

  Generate 5 question-answer flashcards from the following text.

  Text: {{{text}}}

  Format the flashcards as a JSON array of objects, where each object has a "question" and an "answer" field.
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

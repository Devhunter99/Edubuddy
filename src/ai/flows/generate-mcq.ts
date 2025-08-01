'use server';

/**
 * @fileOverview Generates multiple-choice questions (MCQs) from input text using AI.
 *
 * - generateMCQ - A function that generates MCQs from input text.
 * - GenerateMCQInput - The input type for the generateMCQ function.
 * - GenerateMCQOutput - The return type for the generateMCQ function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMCQInputSchema = z.object({
  text: z.string().describe('The text to generate MCQs from.'),
  difficulty: z.enum(['easy', 'normal', 'hard']).describe('The difficulty of the MCQs to generate.'),
  questionCount: z.number().optional().default(10).describe('The number of MCQs to generate.'),
});
export type GenerateMCQInput = z.infer<typeof GenerateMCQInputSchema>;

const GenerateMCQOutputSchema = z.object({
  mcqs: z.array(
    z.object({
      question: z.string().describe('The multiple-choice question.'),
      options: z.array(z.string()).describe('The four options for the question.'),
      correctAnswer: z.string().describe('The correct answer from the options list.'),
    })
  ).describe('An array of multiple-choice questions with 4 options each.'),
  progress: z.string().describe('A short summary of the MCQ generation process.'),
});
export type GenerateMCQOutput = z.infer<typeof GenerateMCQOutputSchema>;

export async function generateMCQ(input: GenerateMCQInput): Promise<GenerateMCQOutput> {
  return generateMCQFlow(input);
}

const generateMCQPrompt = ai.definePrompt({
  name: 'generateMCQPrompt',
  input: {schema: GenerateMCQInputSchema},
  output: {schema: GenerateMCQOutputSchema},
  prompt: `You are an expert educator creating multiple-choice questions from text.

  Create {{questionCount}} multiple-choice questions from the following text, with four options each.
  The difficulty of the questions should be {{difficulty}}.

  For each question, provide a 'question' text, an array of four 'options', and a 'correctAnswer' field containing the exact text of the correct option.
  DO NOT put any asterisks or markers in the 'options' array itself.

  Text: {{{text}}}

  Format the response as a JSON object with a 'mcqs' field that is an array of question objects.

  Include a 'progress' field with a short summary of the MCQ generation process.
  `,
});

const generateMCQFlow = ai.defineFlow(
  {
    name: 'generateMCQFlow',
    inputSchema: GenerateMCQInputSchema,
    outputSchema: GenerateMCQOutputSchema,
  },
  async input => {
    const {output} = await generateMCQPrompt(input);
    return {
      ...output!,
      progress: `Generated ${input.questionCount} multiple-choice questions from the input text.`,
    };
  }
);

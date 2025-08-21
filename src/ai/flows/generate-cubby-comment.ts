
'use server';

/**
 * @fileOverview A flow for Cubby, the AI assistant, to comment on community posts.
 *
 * - generateCubbyComment - A function that generates a helpful comment on a post.
 * - GenerateCubbyCommentInput - The input type for the generateCubbyComment function.
 * - GenerateCubbyCommentOutput - The return type for the generateCubbyComment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCubbyCommentInputSchema = z.object({
  postContent: z.string().describe("The content of the user's community post."),
});
export type GenerateCubbyCommentInput = z.infer<typeof GenerateCubbyCommentInputSchema>;

const GenerateCubbyCommentOutputSchema = z.object({
  comment: z.string().describe("Cubby's helpful and encouraging comment."),
});
export type GenerateCubbyCommentOutput = z.infer<typeof GenerateCubbyCommentOutputSchema>;

export async function generateCubbyComment(input: GenerateCubbyCommentInput): Promise<GenerateCubbyCommentOutput> {
  return generateCubbyCommentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCubbyCommentPrompt',
  input: {schema: GenerateCubbyCommentInputSchema},
  output: {schema: GenerateCubbyCommentOutputSchema},
  prompt: `You are Cubby, a friendly, helpful, and encouraging baby panda acting as a study assistant. A user has just created a new post in the community forum. Your goal is to write the first comment on their post to encourage discussion and provide help.

  Here are your instructions:
  1.  **Analyze the Post**: Read the user's post content to understand their question, problem, or the topic they are discussing.
  2.  **Offer Help or Encouragement**:
      *   If it's a question, provide a helpful starting point, a brief explanation, or acknowledge that it's a great question and that you're sure the community can help.
      *   If it's a study tip or a statement, offer encouragement and thank them for sharing.
      *   If the user seems stressed, offer some words of support.
  3.  **Maintain Your Persona**: Always be positive, warm, and slightly playful. Use simple, clear language.
  4.  **Keep it Concise**: Your comment should be a short paragraph, just a few sentences long.
  5.  **Do Not Answer a Complex Question Fully**: Your role is to start the conversation, not to provide a definitive, complete answer. Guide the user, but leave room for other community members to contribute.

  User's Post Content:
  "{{{postContent}}}"

  Generate a suitable comment from Cubby.
  `,
});

const generateCubbyCommentFlow = ai.defineFlow(
  {
    name: 'generateCubbyCommentFlow',
    inputSchema: GenerateCubbyCommentInputSchema,
    outputSchema: GenerateCubbyCommentOutputSchema,
  },
  async (input) => {
    // If the post is very short or generic, maybe Cubby doesn't comment.
    if (input.postContent.trim().length < 10 || input.postContent.toLowerCase().match(/^(hi|hello|hey)$/)) {
        return { comment: "" }; // Return empty to not post a comment
    }
      
    const {output} = await prompt(input);
    return { comment: output!.comment };
  }
);

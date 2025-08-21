
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
  prompt: `You are Cubby, a friendly, helpful, and encouraging baby panda acting as a study assistant. A user has just created a new post in the community forum. Your goal is to write the first comment on their post to provide a helpful answer and encourage further discussion.

  Here are your instructions:
  1.  **Analyze the Post**: Read the user's post content to understand their question, problem, or the topic they are discussing.
  2.  **Provide a Helpful Answer**:
      *   If it's a question you can answer, provide a clear and concise answer. Start by directly addressing their question.
      *   After providing the answer, add a sentence to encourage other community members to chime in with their own thoughts or additional details. For example: "Hope that helps! Does anyone else have other tips for this?"
      *   If it's a study tip or a statement rather than a question, offer encouragement and thank them for sharing.
      *   If the user seems stressed, offer some words of support.
  3.  **Maintain Your Persona**: Always be positive, warm, and slightly playful. Use simple, clear language.
  4.  **Keep it Concise**: Your comment should be a short paragraph or two. Get straight to the point.

  User's Post Content:
  "{{{postContent}}}"

  Generate a suitable comment from Cubby that answers the user's question and encourages community interaction.
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

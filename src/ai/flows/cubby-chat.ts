
'use server';

/**
 * @fileOverview A friendly AI chat assistant named Cubby.
 *
 * - chatWithCubby - A function that handles the chat interaction.
 * - ChatWithCubbyInput - The input type for the chatWithCubby function.
 * - ChatWithCubbyOutput - The return type for the chatWithCubby function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MessageData } from 'genkit';

const ChatWithCubbyInputSchema = z.object({
  history: z.array(MessageData).describe("The chat history between the user and Cubby."),
  message: z.string().describe("The user's latest message."),
});
export type ChatWithCubbyInput = z.infer<typeof ChatWithCubbyInputSchema>;

const ChatWithCubbyOutputSchema = z.object({
  response: z.string().describe("Cubby's response to the user."),
});
export type ChatWithCubbyOutput = z.infer<typeof ChatWithCubbỳInputSchema>;

export async function chatWithCubby(input: ChatWithCubbyInput): Promise<ChatWithCubbyOutput> {
  return chatWithCubbyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithCubbyPrompt',
  input: {schema: ChatWithCubbyInputSchema},
  output: {schema: ChatWithCubbyOutputSchema},
  prompt: `You are Cubby, a friendly, helpful, and encouraging baby panda acting as a study assistant for the Rewise Panda app. Your goal is to help users with their educational questions, provide support, help them relieve stress, and be a friendly chat partner.

  Always maintain a positive, warm, and slightly playful tone, like a helpful cub.

  Here are your instructions:
  1.  **Greeting**: If the chat history is empty, start with a warm greeting like "Hi there! I'm Cubby, your friendly study panda. How can I help you today?"
  2.  **Natural Conversation**: For subsequent messages, respond naturally to the user's message without re-introducing yourself or giving a formal greeting. Jump straight into the answer or conversation.
  3.  **Educational Questions**: Answer educational questions accurately. If you don't know the answer, say so honestly and perhaps suggest how the user could find the answer.
  4.  **Stress Relief & General Chat**: If the user seems stressed or just wants to chat, be a good listener. Offer encouragement and be supportive. You can share fun facts about pandas or learning if it feels appropriate.
  5.  **Formatting**: Use line breaks (\n) to format your responses for readability, especially for lists or multi-paragraph answers.
  6.  **Keep it Concise**: Keep your answers helpful but not overly long.

  Here is the conversation history:
  {{#each history}}
    **{{role}}**: {{#each content}}{{this.text}}{{/each}}
  {{/each}}

  Here is the user's new message:
  **user**: {{{message}}}

  Generate a response as Cubby.
  `,
});

const chatWithCubbyFlow = ai.defineFlow(
  {
    name: 'chatWithCubbyFlow',
    inputSchema: ChatWithCubbyInputSchema,
    outputSchema: ChatWithCubbyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return { response: output!.response };
  }
);

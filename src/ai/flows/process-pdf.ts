
'use server';

/**
 * @fileOverview A flow to process a PDF file and extract its text content
 * using a powerful AI OCR model.
 *
 * - processPdf - A function that handles the PDF processing.
 * - ProcessPdfInput - The input type for the processPdf function.
 * - ProcessPdfOutput - The return type for the processPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file encoded as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'"
    ),
});
export type ProcessPdfInput = z.infer<typeof ProcessPdfInputSchema>;

const ProcessPdfOutputSchema = z.object({
  text: z.string().describe('The extracted text content of the PDF.'),
});
export type ProcessPdfOutput = z.infer<typeof ProcessPdfOutputSchema>;


export async function processPdf(input: ProcessPdfInput): Promise<ProcessPdfOutput> {
    return processPdfFlow(input);
}

// A specific prompt for extracting text from a PDF image.
const ocrPrompt = ai.definePrompt({
    name: 'ocrPrompt',
    input: { schema: ProcessPdfInputSchema },
    output: { schema: ProcessPdfOutputSchema },
    prompt: `Extract all text from the provided PDF document. The PDF might contain scanned pages, images of text, or mixed content. Transcribe the text exactly as it appears.

    PDF Document: {{media url=pdfDataUri}}`,
});


const processPdfFlow = ai.defineFlow(
  {
    name: 'processPdfFlow',
    inputSchema: ProcessPdfInputSchema,
    outputSchema: ProcessPdfOutputSchema,
  },
  async (input) => {
    // Use AI OCR for all PDF processing to ensure maximum accuracy and completeness.
    console.log("Processing PDF with AI OCR...");
    const { output } = await ocrPrompt(input);

    if (!output || !output.text) {
        throw new Error("AI OCR failed to extract text from the PDF.");
    }
    
    return { text: output.text };
  }
);

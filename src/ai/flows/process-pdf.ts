
'use server';

/**
 * @fileOverview A flow to process a PDF file and extract its text content.
 *
 * - processPdf - A function that handles the PDF processing.
 * - ProcessPdfInput - The input type for the processPdf function.
 * - ProcessPdfOutput - The return type for the processPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import PDFParser from 'pdf2json';

const ProcessPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file encoded as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
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

const processPdfFlow = ai.defineFlow(
  {
    name: 'processPdfFlow',
    inputSchema: ProcessPdfInputSchema,
    outputSchema: ProcessPdfOutputSchema,
  },
  async (input) => {
    const base64Data = input.pdfDataUri.split(',')[1];
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    const pdfParser = new PDFParser(this, 1);

    const text = await new Promise<string>((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData: any) => {
            console.error(errData.parserError);
            reject(errData.parserError);
        });
        pdfParser.on('pdfParser_dataReady', () => {
            resolve((pdfParser as any).getRawTextContent());
        });

        pdfParser.parseBuffer(pdfBuffer);
    });

    return {
      text,
    };
  }
);

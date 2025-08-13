
'use server';

/**
 * @fileOverview A flow to process a PDF file and extract its text content.
 * It first tries a standard library, and if that fails, uses AI OCR.
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
    // First, try to extract text using the pdf2json library.
    // This is fast and works well for text-based PDFs.
    try {
        const base64Data = input.pdfDataUri.split(',')[1];
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        
        const pdfParser = new PDFParser(this, 1);

        const parsedText = await new Promise<string>((resolve, reject) => {
            pdfParser.on('pdfParser_dataError', (errData: any) => {
                console.error("pdf2json error:", errData.parserError);
                // Don't reject, just resolve with empty string to fall back to OCR
                resolve(''); 
            });
            pdfParser.on('pdfParser_dataReady', () => {
                resolve((pdfParser as any).getRawTextContent());
            });

            pdfParser.parseBuffer(pdfBuffer);
        });

        // If pdf2json returns a reasonable amount of text, use it.
        if (parsedText && parsedText.trim().length > 100) {
             console.log("Successfully extracted text with pdf2json.");
            return { text: parsedText };
        }
    } catch (error) {
        console.error("Error with pdf2json, falling back to AI OCR:", error);
    }
    
    // If pdf2json fails or returns very little text, fall back to AI OCR.
    // This is better for scanned PDFs or PDFs with images of text.
    console.log("Falling back to AI OCR for PDF processing...");
    const { output } = await ocrPrompt(input);

    if (!output || !output.text) {
        throw new Error("AI OCR failed to extract text from the PDF.");
    }
    
    return { text: output.text };
  }
);

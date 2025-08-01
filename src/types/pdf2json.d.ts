declare module 'pdf2json' {
    class PDFParser {
        constructor(context?: any, version?: number);
        on(eventName: string, callback: (data: any) => void): void;
        parseBuffer(buffer: Buffer): void;
        loadPDF(pdfFilePath: string): void;
        createParserStream(): any;
        getRawTextContent(): string;
        getAllFieldsTypes(): any[];
        getFillableTextFields(): any;
        getRawTextContentStream(): any;
    }
    export default PDFParser;
}


import { config } from 'dotenv';
config();

import '@/ai/flows/generate-mcq.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-summary.ts';
import '@/ai/flows/generate-detailed-summary.ts';
import '@/ai/flows/generate-highlights.ts';
import '@/ai/flows/process-pdf.ts';
import '@/ai/tools/search.ts';


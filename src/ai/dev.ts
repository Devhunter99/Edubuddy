import { config } from 'dotenv';
config();

import '@/ai/flows/generate-mcq.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-summary.ts';
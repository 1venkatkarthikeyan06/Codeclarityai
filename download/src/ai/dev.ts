import { config } from 'dotenv';
config();

import '@/ai/flows/generate-code-documentation.ts';
import '@/ai/flows/suggest-code-refactorings.ts';
import '@/ai/flows/analyze-code-complexity.ts';
import '@/ai/flows/generate-unit-tests.ts';

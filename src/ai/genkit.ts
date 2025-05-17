import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // No default model configured as no flows are active by default.
  // model: 'googleai/gemini-2.0-flash',
});

'use server';

/**
 * @fileOverview A customer insights AI agent that highlights key data points for each customer.
 *
 * - getCustomerInsights - A function that handles the customer insights process.
 * - CustomerInsightsInput - The input type for the getCustomerInsights function.
 * - CustomerInsightsOutput - The return type for the getCustomerInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerInsightsInputSchema = z.object({
  customerData: z.string().describe('The customer data in JSON format.'),
});
export type CustomerInsightsInput = z.infer<typeof CustomerInsightsInputSchema>;

const CustomerInsightsOutputSchema = z.object({
  keyInsights: z
    .string()
    .describe(
      'Key data points that need immediate attention, such as upcoming payment dates or large outstanding balances.'
    ),
});
export type CustomerInsightsOutput = z.infer<typeof CustomerInsightsOutputSchema>;

export async function getCustomerInsights(input: CustomerInsightsInput): Promise<CustomerInsightsOutput> {
  return customerInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerInsightsPrompt',
  input: {schema: CustomerInsightsInputSchema},
  output: {schema: CustomerInsightsOutputSchema},
  prompt: `You are an expert customer data analyst. Analyze the following customer data and identify key insights that need immediate attention, such as upcoming payment dates or large outstanding balances.

Customer Data: {{{customerData}}}

Provide a concise summary of the key insights. Focus on the data points that requires administrator to take actions.`,
});

const customerInsightsFlow = ai.defineFlow(
  {
    name: 'customerInsightsFlow',
    inputSchema: CustomerInsightsInputSchema,
    outputSchema: CustomerInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

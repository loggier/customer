"use client";

import type { Customer } from '@/types/customer';
import { getCustomerInsights, type CustomerInsightsOutput } from '@/ai/flows/customer-insights';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AiInsightButtonProps {
  customer: Customer;
}

export function AiInsightButton({ customer }: AiInsightButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [insight, setInsight] = useState<CustomerInsightsOutput | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleGetInsight = () => {
    startTransition(async () => {
      try {
        // Serialize only necessary data or the whole object if the AI model expects it
        const customerDataForAI = JSON.stringify({
          name: customer.customer_name,
          nextPayment: customer.date_next_payment,
          value: customer.value,
          pendingInvoices: customer.nv_pendings,
        });

        const result = await getCustomerInsights({ customerData: customerDataForAI });
        setInsight(result);
        setIsModalOpen(true);
      } catch (error) {
        console.error("Failed to get AI insights:", error);
        toast({
          title: "Error",
          description: "Failed to generate AI insights. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGetInsight}
        disabled={isPending}
        aria-label="Get AI Insights"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Insights
      </Button>

      {insight && (
         <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-accent" />
                AI Insights for {customer.customer_name}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {insight.keyInsights}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsModalOpen(false)}>Got it!</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

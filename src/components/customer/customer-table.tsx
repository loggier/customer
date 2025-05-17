"use client";

import type { Customer } from '@/types/customer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AiInsightButton } from './ai-insight-button';
import { Eye, Send, History } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerTableProps {
  customers: Customer[];
  onViewDetails: (customer: Customer) => void;
}

export function CustomerTable({ customers, onViewDetails }: CustomerTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    // Assuming value is in a local currency, adjust 'USD' and locale as needed.
    // For example, for Peruvian Sol: new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numValue);
  }


  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Customer Name</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Next Payment</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center w-[300px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.customer_name}</TableCell>
                <TableCell>{customer.license_plate}</TableCell>
                <TableCell>{formatDate(customer.date_next_payment)}</TableCell>
                <TableCell>{formatCurrency(customer.value)}</TableCell>
                <TableCell>
                  <Badge variant={new Date(customer.date_next_payment) < new Date() ? 'destructive' : 'default'}>
                    {new Date(customer.date_next_payment) < new Date() ? 'Overdue' : 'Active'}
                  </Badge>
                  {customer.nv_pendings > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {customer.nv_pendings} Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onViewDetails(customer)} aria-label="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <AiInsightButton customer={customer} />
                  <Button variant="ghost" size="icon" onClick={() => alert(`Action: Send Reminder to ${customer.customer_name}`)} aria-label="Send Reminder">
                     <Send className="h-4 w-4" />
                  </Button>
                   <Button variant="ghost" size="icon" onClick={() => alert(`Action: View History for ${customer.customer_name}`)} aria-label="View History">
                     <History className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

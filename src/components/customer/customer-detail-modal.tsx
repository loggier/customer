"use client";

import type { Customer } from '@/types/customer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailModal({ customer, isOpen, onClose }: CustomerDetailModalProps) {
  if (!customer) return null;

  const parsePhones = (phonesStr: string): string[] => {
    try {
      const phones = JSON.parse(phonesStr);
      return Array.isArray(phones) ? phones : [];
    } catch (error) {
      return [];
    }
  };

  const phones = parsePhones(customer.phones);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numValue); // Adjust currency as needed
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{customer.customer_name}</DialogTitle>
          <DialogDescription>
            Customer ID: {customer.customer_id} | License Plate: {customer.license_plate}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Date of Initiation:</span>
              <span>{formatDate(customer.date_init)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Next Payment Date:</span>
              <span>{formatDate(customer.date_next_payment)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Payment Period:</span>
              <span>{customer.count_period} {customer.type_period}(s)</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Value:</span>
              <span>{formatCurrency(customer.value)}</span>
            </div>
             <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Total:</span>
              <span>{formatCurrency(customer.total)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Apply Notification:</span>
              <Badge variant={customer.apply_notyfication ? 'default' : 'secondary'}>
                {customer.apply_notyfication ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <span className="font-semibold">Phones:</span>
              <div>
                {phones.length > 0 ? (
                  phones.map((phone, index) => <div key={index}>{phone}</div>)
                ) : (
                  <span>N/A</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Pending Invoices (nv_pendings):</span>
              <span>{customer.nv_pendings}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Created At:</span>
              <span>{formatDate(customer.created_at)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Last Updated At:</span>
              <span>{formatDate(customer.updated_at)}</span>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

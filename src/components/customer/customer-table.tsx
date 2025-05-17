
"use client";

import type { Customer } from '@/types/customer';
import type { BadgeProps } from '@/components/ui/badge'; // Import BadgeProps for variant typing
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
import { Eye } from 'lucide-react';
import { format, differenceInMonths, startOfDay, isFuture, isEqual } from 'date-fns';
import { es } from 'date-fns/locale'; // Para formato de fecha en español
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import React from 'react'; // useEffect, useState for client-side rendering

interface CustomerTableProps {
  customers: Customer[];
  onViewDetails: (customer: Customer) => void;
  onToggleAccountStatus: (customerId: number) => void;
  clientToday: Date | null; // To be passed from parent for consistent "today"
}

interface OverdueStatus {
  monthsOverdue: number;
  label: string;
  variant: BadgeProps['variant'];
  textColorClassName?: string;
}

const getOverdueStatus = (
  nextPaymentDateStr: string | null | undefined,
  isActive: boolean,
  nvPendings: number,
  todayDate: Date // Use passed todayDate
): OverdueStatus => {
  if (!isActive) {
    return { monthsOverdue: 0, label: 'Inactiva', variant: 'destructive' };
  }
  if (!nextPaymentDateStr) {
    return { monthsOverdue: 0, label: 'Fecha Inválida', variant: 'outline' };
  }

  const nextPaymentDate = startOfDay(new Date(nextPaymentDateStr));
  // todayDate is already startOfDay from parent

  let monthsOverdue = 0;
  if (nextPaymentDate < todayDate) {
    monthsOverdue = differenceInMonths(todayDate, nextPaymentDate);
  }

  let pendingLabel = "";
  if (nvPendings > 0) {
    pendingLabel = ` (${nvPendings} pend.)`;
  }

  if (monthsOverdue <= 0) {
    // Handles cases where payment is today, in the future, or even slightly in the past but within the same month.
    // differenceInMonths will be 0 if it's not a full month overdue.
    if (isFuture(nextPaymentDate) || isEqual(nextPaymentDate, todayDate) || differenceInMonths(todayDate, nextPaymentDate, {roundingMethod: 'floor'}) === 0 && nextPaymentDate < todayDate) {
       return { monthsOverdue: 0, label: `Al día${pendingLabel}`, variant: 'default' };
    }
    // This case should ideally not be hit if logic is correct above, but as a fallback for "current month".
    return { monthsOverdue: 0, label: `Al día${pendingLabel}`, variant: 'default' };
  } else if (monthsOverdue === 1) {
    return { monthsOverdue, label: `1 mes venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-amber-700 dark:text-amber-500' };
  } else if (monthsOverdue === 2) {
    return { monthsOverdue, label: `2 meses venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-orange-700 dark:text-orange-500' };
  } else { 
    return { monthsOverdue, label: `${monthsOverdue} meses venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-red-700 dark:text-red-600' };
  }
};


export function CustomerTable({ customers, onViewDetails, onToggleAccountStatus, clientToday }: CustomerTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP', { locale: es });
    } catch (error) {
      return 'Fecha Inválida';
    }
  };
  
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(numValue);
  }

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Nombre del Cliente</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Próximo Pago</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="w-[180px]">Estado</TableHead>
            <TableHead className="text-center w-[220px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {clientToday ? 'No se encontraron clientes con los filtros seleccionados.' : 'Cargando clientes...'}
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const status = clientToday ? getOverdueStatus(customer.date_next_payment, customer.is_active, customer.nv_pendings, clientToday) : null;
              // Switch is disabled only if the status hasn't been calculated yet (i.e., clientToday is not set)
              const switchDisabled = !status; 

              return (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.customer_name}</TableCell>
                  <TableCell>{customer.license_plate}</TableCell>
                  <TableCell>{clientToday ? formatDate(customer.date_next_payment) : '...'}</TableCell>
                  <TableCell>{formatCurrency(customer.value)}</TableCell>
                  <TableCell>
                    {status ? (
                      <Badge variant={status.variant} className={status.textColorClassName}>
                        {status.label}
                      </Badge>
                    ) : (
                      '...'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => onViewDetails(customer)} aria-label="Ver Detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-1">
                        <Switch
                          id={`toggle-active-${customer.id}`}
                          checked={customer.is_active}
                          onCheckedChange={() => onToggleAccountStatus(customer.id)}
                          disabled={switchDisabled}
                          aria-label={customer.is_active ? "Desactivar cuenta" : "Activar cuenta"}
                        />
                        <Label htmlFor={`toggle-active-${customer.id}`} className={`text-xs cursor-pointer select-none ${switchDisabled ? 'text-muted-foreground' : ''}`}>
                          {customer.is_active ? "Activa" : "Inactiva"}
                        </Label>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}


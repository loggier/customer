
"use client";

import type { Customer } from '@/types/customer';
import type { BadgeProps } from '@/components/ui/badge'; 
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
import { Checkbox } from '@/components/ui/checkbox';
import { Eye } from 'lucide-react';
import { format, differenceInMonths, startOfDay, isFuture, isEqual } from 'date-fns';
import { es } from 'date-fns/locale'; 
import React from 'react';

interface CustomerTableProps {
  customers: Customer[]; // These are paginated customers
  onViewDetails: (customer: Customer) => void;
  clientToday: Date | null;
  selectedCustomerIds: Set<number>;
  onSelectCustomer: (customerId: number, isSelected: boolean) => void;
  onSelectAllFilteredCustomers: (isSelected: boolean) => void;
  areAllFilteredCustomersSelected: boolean;
  isAnyFilteredCustomerSelected: boolean;
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
  todayDate: Date 
): OverdueStatus => {
  if (!isActive) {
    // If inactive, we might still want to show payment status if relevant,
    // but the primary status is 'Inactiva'. For this label, we focus on payment.
    // The 'Estado Cuenta' column will show 'Inactiva'.
    // Let's assume for an inactive account, overdue status is less prominent or N/A.
    // However, if we want to show it:
    // return { monthsOverdue: 0, label: 'Inactiva', variant: 'destructive' };
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
    // Covers payments due today, in the future, or paid within the current month but past due date
     if (isFuture(nextPaymentDate) || isEqual(nextPaymentDate, todayDate) || (differenceInMonths(todayDate, nextPaymentDate, {roundingMethod: 'floor'}) === 0 && nextPaymentDate < todayDate)) {
       return { monthsOverdue: 0, label: `Al día${pendingLabel}`, variant: 'default' };
    }
    // This case might be redundant if the above covers all non-overdue scenarios
    return { monthsOverdue: 0, label: `Al día${pendingLabel}`, variant: 'default' };
  } else if (monthsOverdue === 1) {
    return { monthsOverdue, label: `1 mes venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-amber-700 dark:text-amber-500' };
  } else if (monthsOverdue === 2) {
    return { monthsOverdue, label: `2 meses venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-orange-700 dark:text-orange-500' };
  } else { 
    return { monthsOverdue, label: `${monthsOverdue} meses venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-red-700 dark:text-red-600' };
  }
};


export function CustomerTable({ 
  customers, 
  onViewDetails, 
  clientToday,
  selectedCustomerIds,
  onSelectCustomer,
  onSelectAllFilteredCustomers,
  areAllFilteredCustomersSelected,
  isAnyFilteredCustomerSelected
}: CustomerTableProps) {
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

  const handleSelectAllChange = (checked: boolean | 'indeterminate') => {
    // The 'indeterminate' state from Checkbox means it was clicked while indeterminate.
    // We interpret this as wanting to select all if it wasn't fully selected,
    // or deselect all if it was.
    if (areAllFilteredCustomersSelected) {
      onSelectAllFilteredCustomers(false);
    } else {
      onSelectAllFilteredCustomers(true);
    }
  };
  
  const masterCheckboxState = areAllFilteredCustomersSelected
    ? true
    : isAnyFilteredCustomerSelected
    ? 'indeterminate'
    : false;

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={masterCheckboxState}
                onCheckedChange={handleSelectAllChange}
                aria-label="Seleccionar todos los clientes filtrados"
                disabled={customers.length === 0 || !clientToday}
              />
            </TableHead>
            <TableHead className="w-[250px]">Nombre del Cliente</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Próximo Pago</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="w-[150px]">Estado Cuenta</TableHead>
            <TableHead className="w-[180px]">Estado Pago</TableHead>
            <TableHead className="text-center w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                {clientToday ? 'No se encontraron clientes con los filtros seleccionados.' : 'Cargando clientes...'}
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const paymentStatus = clientToday ? getOverdueStatus(customer.date_next_payment, customer.is_active, customer.nv_pendings, clientToday) : null;
              const isSelected = selectedCustomerIds.has(customer.id);

              return (
                <TableRow key={customer.id} data-state={isSelected ? "selected" : ""}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectCustomer(customer.id, !!checked)}
                      aria-label={`Seleccionar cliente ${customer.customer_name}`}
                      disabled={!clientToday}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{customer.customer_name}</TableCell>
                  <TableCell>{customer.license_plate}</TableCell>
                  <TableCell>{clientToday ? formatDate(customer.date_next_payment) : '...'}</TableCell>
                  <TableCell>{formatCurrency(customer.value)}</TableCell>
                  <TableCell>
                     <Badge variant={customer.is_active ? 'default' : 'destructive'}>
                        {customer.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                  </TableCell>
                  <TableCell>
                    {paymentStatus && customer.is_active ? ( // Only show payment status if account is active
                      <Badge variant={paymentStatus.variant} className={paymentStatus.textColorClassName}>
                        {paymentStatus.label}
                      </Badge>
                    ) : customer.is_active ? ( // Active but payment status is loading
                      '...'
                    ) : ( // Inactive account, don't show payment status badge or use a specific one
                       <Badge variant={'outline'}>N/A</Badge> // Or some other indication
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(customer)} aria-label="Ver Detalles">
                      <Eye className="h-4 w-4" />
                    </Button>
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

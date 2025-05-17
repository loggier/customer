
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
import { Eye, Send, History } from 'lucide-react';
import { format, differenceInMonths, startOfDay, isFuture, isEqual } from 'date-fns';
// import { es } from 'date-fns/locale'; // Para formato de fecha en español
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CustomerTableProps {
  customers: Customer[];
  onViewDetails: (customer: Customer) => void;
  onToggleAccountStatus: (customerId: number) => void;
}

const OVERDUE_THRESHOLD_MONTHS_FOR_DEACTIVATION = 2; // Clientes activos con 2 o más meses vencidos pueden ser desactivados.

interface OverdueStatus {
  monthsOverdue: number;
  label: string;
  variant: BadgeProps['variant'];
  textColorClassName?: string;
}

const getOverdueStatus = (nextPaymentDateStr: string | null | undefined, isActive: boolean, nvPendings: number): OverdueStatus => {
  if (!isActive) {
    return { monthsOverdue: 0, label: 'Inactiva', variant: 'destructive' };
  }
  if (!nextPaymentDateStr) {
    return { monthsOverdue: 0, label: 'Fecha Inválida', variant: 'outline' };
  }

  const nextPaymentDate = startOfDay(new Date(nextPaymentDateStr));
  const today = startOfDay(new Date());
  
  let monthsOverdue = 0;
  if (nextPaymentDate < today) {
    monthsOverdue = differenceInMonths(today, nextPaymentDate);
  }

  let pendingLabel = "";
  if (nvPendings > 0) {
    pendingLabel = ` (${nvPendings} pend.)`;
  }

  if (monthsOverdue <= 0) { // Al día o futuro
    if (isFuture(nextPaymentDate) || isEqual(nextPaymentDate, today)) {
      return { monthsOverdue: 0, label: `Al día${pendingLabel}`, variant: 'default' };
    }
    // Esto podría ser una fecha pasada pero que por alguna razón no calculó meses vencidos (ej. mismo mes)
    // o una cuenta que se pagó y tiene fecha de pago futura.
    // Por seguridad, si es estrictamente en el pasado y no 0 meses, lo tratamos como vencido.
    // La lógica de monthsOverdue ya cubre esto, asi que 'Al día' es correcto aqui.
    return { monthsOverdue: 0, label: `Al día${pendingLabel}`, variant: 'default' };
  } else if (monthsOverdue === 1) {
    return { monthsOverdue, label: `1 mes venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-amber-700 dark:text-amber-500' };
  } else if (monthsOverdue === 2) {
    return { monthsOverdue, label: `2 meses venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-orange-700 dark:text-orange-500' };
  } else { // 3+ meses
    return { monthsOverdue, label: `${monthsOverdue} meses venc.${pendingLabel}`, variant: 'outline', textColorClassName: 'text-red-700 dark:text-red-600' };
  }
};


export function CustomerTable({ customers, onViewDetails, onToggleAccountStatus }: CustomerTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      // return format(new Date(dateString), 'PP', { locale: es }); // Ejemplo con localización
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return 'Fecha Inválida';
    }
  };
  
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(numValue); // Ajustado a PEN
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
            <TableHead>Estado</TableHead>
            <TableHead className="text-center w-[380px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No se encontraron clientes con los filtros seleccionados.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const status = getOverdueStatus(customer.date_next_payment, customer.is_active, customer.nv_pendings);
              const canBeDeactivated = customer.is_active && status.monthsOverdue >= OVERDUE_THRESHOLD_MONTHS_FOR_DEACTIVATION;
              const switchDisabled = customer.is_active && !canBeDeactivated;

              return (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.customer_name}</TableCell>
                  <TableCell>{customer.license_plate}</TableCell>
                  <TableCell>{formatDate(customer.date_next_payment)}</TableCell>
                  <TableCell>{formatCurrency(customer.value)}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className={status.textColorClassName}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => onViewDetails(customer)} aria-label="Ver Detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* AiInsightButton fue removido */}
                      <Button variant="ghost" size="icon" onClick={() => alert(`Acción: Enviar Recordatorio a ${customer.customer_name}`)} aria-label="Enviar Recordatorio">
                         <Send className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => alert(`Acción: Ver Historial para ${customer.customer_name}`)} aria-label="Ver Historial">
                         <History className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-1 pl-2 border-l ml-1">
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

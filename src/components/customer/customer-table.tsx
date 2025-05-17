
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
// Consider adding locale for date-fns if full i18n is needed:
// import { es } from 'date-fns/locale';

interface CustomerTableProps {
  customers: Customer[];
  onViewDetails: (customer: Customer) => void;
  onToggleAccountStatus: (customerId: number) => void;
}

const OVERDUE_THRESHOLD_DAYS = 60; // Más de 2 meses

export function CustomerTable({ customers, onViewDetails, onToggleAccountStatus }: CustomerTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'; // Or 'No disponible'
    try {
      // For full Spanish date formatting, pass locale: format(new Date(dateString), 'PP', { locale: es });
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return 'Fecha Inválida';
    }
  };
  
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A'; // Or 'No disponible'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numValue);
  }

  const isSignificantlyOverdue = (nextPaymentDate: string): boolean => {
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    // Set hours to 0 to compare dates only, avoiding time zone issues for day difference
    today.setHours(0, 0, 0, 0);
    paymentDate.setHours(0, 0, 0, 0);
    
    if (paymentDate >= today) return false; // Not overdue or due today

    const diffTime = today.getTime() - paymentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > OVERDUE_THRESHOLD_DAYS;
  };

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
            <TableHead className="text-center w-[420px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No se encontraron clientes.
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
                  {!customer.is_active ? (
                    <Badge variant="destructive">Inactiva</Badge>
                  ) : new Date(customer.date_next_payment) < new Date() ? (
                    <Badge variant="outline">Vencido</Badge>
                  ) : (
                    <Badge variant="default">Al día</Badge>
                  )}
                  {customer.nv_pendings > 0 && customer.is_active && (
                    <Badge variant="outline" className="ml-2">
                      {customer.nv_pendings} Pendiente(s)
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(customer)} aria-label="Ver Detalles">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AiInsightButton customer={customer} />
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
                        disabled={customer.is_active && !isSignificantlyOverdue(customer.date_next_payment)}
                        aria-label={customer.is_active ? "Desactivar cuenta" : "Activar cuenta"}
                      />
                      <Label htmlFor={`toggle-active-${customer.id}`} className="text-xs cursor-pointer select-none">
                        {customer.is_active ? "Activa" : "Inactiva"}
                      </Label>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

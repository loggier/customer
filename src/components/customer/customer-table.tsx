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
// Consider adding locale for date-fns if full i18n is needed:
// import { es } from 'date-fns/locale';

interface CustomerTableProps {
  customers: Customer[];
  onViewDetails: (customer: Customer) => void;
}

export function CustomerTable({ customers, onViewDetails }: CustomerTableProps) {
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
            <TableHead className="text-center w-[300px]">Acciones</TableHead>
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
                  <Badge variant={new Date(customer.date_next_payment) < new Date() ? 'destructive' : 'default'}>
                    {new Date(customer.date_next_payment) < new Date() ? 'Vencido' : 'Activo'}
                  </Badge>
                  {customer.nv_pendings > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {customer.nv_pendings} Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center space-x-1">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

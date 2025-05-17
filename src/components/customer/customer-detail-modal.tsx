
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
import { es } from 'date-fns/locale'; // Importar locale

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
    if (!dateString) return 'No disponible';
    try {
      return format(new Date(dateString), 'PPP p', { locale: es }); // Usar locale
    } catch (error) {
      return 'Fecha Inválida';
    }
  };
  
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'No disponible';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(numValue); // Ajustado a PEN
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{customer.customer_name}</DialogTitle>
          <DialogDescription>
            ID de Cliente: {customer.customer_id} | Matrícula: {customer.license_plate}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Estado de Cuenta:</span>
              <Badge variant={customer.is_active ? 'default' : 'destructive'}>
                {customer.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Fecha de Inicio:</span>
              <span>{formatDate(customer.date_init)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Próxima Fecha de Pago:</span>
              <span>{formatDate(customer.date_next_payment)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Período de Pago:</span>
              <span>{customer.count_period} {customer.type_period === 'year' ? 'año(s)' : customer.type_period === 'month' ? 'mes(es)' : 'día(s)'}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Valor:</span>
              <span>{formatCurrency(customer.value)}</span>
            </div>
             <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Total:</span>
              <span>{formatCurrency(customer.total)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Aplicar Notificación:</span>
              <Badge variant={customer.apply_notyfication ? 'default' : 'secondary'}>
                {customer.apply_notyfication ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <span className="font-semibold">Teléfonos:</span>
              <div>
                {phones.length > 0 ? (
                  phones.map((phone, index) => <div key={index}>{phone}</div>)
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Facturas Pendientes (nv_pendings):</span>
              <span>{customer.nv_pendings}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Creado el:</span>
              <span>{formatDate(customer.created_at)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-semibold">Última Actualización:</span>
              <span>{formatDate(customer.updated_at)}</span>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

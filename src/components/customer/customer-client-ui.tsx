
"use client";

import type { Customer } from '@/types/customer';
import React, { useState, useMemo, useEffect } from 'react';
import { CustomerTable } from './customer-table';
import { PaginationControls } from './pagination-controls';
import { CustomerDetailModal } from './customer-detail-modal';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { differenceInMonths, startOfDay } from 'date-fns';

interface CustomerClientUIProps {
  initialCustomers: Customer[];
}

const ITEMS_PER_PAGE = 5;

// Helper function to calculate months overdue
const calculateMonthsOverdue = (nextPaymentDateStr: string | null | undefined): number => {
  if (!nextPaymentDateStr) return 0;
  const nextPaymentDate = startOfDay(new Date(nextPaymentDateStr));
  const today = startOfDay(new Date());

  if (nextPaymentDate >= today) {
    return 0; // Not overdue or due today/in future
  }
  
  // differenceInMonths calculates full month differences.
  // e.g., Jan 23 to Feb 23 is 1 month. Jan 23 to Feb 22 is 0 months.
  // The user's example: "si el pago era el dia 23 de enero 2025 el dia de hoy [23 de mayo] tendria 4 meses"
  // differenceInMonths(new Date(2025, 4, 23), new Date(2025, 0, 23)) = 4. This is correct.
  return differenceInMonths(today, nextPaymentDate);
};


export function CustomerClientUI({ initialCustomers }: CustomerClientUIProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [overdueFilter, setOverdueFilter] = useState<string>('all'); // 'all', 'ontime', '1', '2', '3plus'
  const { toast } = useToast();

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_id.includes(searchTerm)
      );
    }

    if (overdueFilter !== 'all') {
      filtered = filtered.filter(customer => {
        const monthsOverdue = calculateMonthsOverdue(customer.date_next_payment);
        switch (overdueFilter) {
          case 'ontime':
            return monthsOverdue <= 0 && customer.is_active; // Al día o próximo y activa
          case 'due':
            return monthsOverdue <= 0 && !customer.is_active; // Vencido pero inactivo (ej. pago futuro pero cuenta inactiva)
          case '1':
            return monthsOverdue === 1 && customer.is_active;
          case '2':
            return monthsOverdue === 2 && customer.is_active;
          case '3plus':
            return monthsOverdue >= 3 && customer.is_active;
          case 'inactive':
            return !customer.is_active;
          default:
            return true;
        }
      });
    }
    return filtered;
  }, [customers, searchTerm, overdueFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage]);


  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search term or filter changes
  }, [searchTerm, overdueFilter]);

  const handleToggleAccountStatus = (customerId: number) => {
    let customerName = "";
    let wasActive = false;

    setCustomers(prevCustomers =>
      prevCustomers.map(c => {
        if (c.id === customerId) {
          customerName = c.customer_name;
          wasActive = c.is_active;
          return { ...c, is_active: !c.is_active };
        }
        return c;
      })
    );

    if (customerName) {
      toast({
        title: "Estado de Cuenta Actualizado",
        description: `La cuenta de ${customerName} ha sido ${!wasActive ? 'activada' : 'desactivada'}.`,
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Gestión de Clientes</CardTitle>
          <CardDescription>Filtra y gestiona los clientes y el estado de sus pagos.</CardDescription>
           <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Buscar por nombre, matrícula o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={overdueFilter} onValueChange={setOverdueFilter}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Filtrar por estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Clientes</SelectItem>
                <SelectItem value="ontime">Al día o Próximo Vencimiento (Activas)</SelectItem>
                <SelectItem value="1">1 Mes Vencido (Activas)</SelectItem>
                <SelectItem value="2">2 Meses Vencidos (Activas)</SelectItem>
                <SelectItem value="3plus">3+ Meses Vencidos (Activas)</SelectItem>
                <SelectItem value="inactive">Cuentas Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <CustomerTable 
            customers={paginatedCustomers} 
            onViewDetails={handleViewDetails}
            onToggleAccountStatus={handleToggleAccountStatus} 
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

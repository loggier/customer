
"use client";

import type { Customer } from '@/types/customer';
import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { CustomerTable } from './customer-table';
import { PaginationControls } from './pagination-controls';
import { CustomerDetailModal } from './customer-detail-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { differenceInMonths, startOfDay } from 'date-fns';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface CustomerClientUIProps {
  initialCustomers: Customer[];
}

const ITEMS_PER_PAGE = 5;

// Helper function to calculate months overdue
const calculateMonthsOverdue = (nextPaymentDateStr: string | null | undefined, todayDate: Date): number => {
  if (!nextPaymentDateStr) return 0;
  const nextPaymentDate = startOfDay(new Date(nextPaymentDateStr));
  // todayDate is already startOfDay

  if (nextPaymentDate >= todayDate) {
    return 0; // Not overdue or due today/in future
  }
  
  return differenceInMonths(todayDate, nextPaymentDate);
};


export function CustomerClientUI({ initialCustomers }: CustomerClientUIProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [overdueFilter, setOverdueFilter] = useState<string>('all'); 
  const { toast } = useToast();
  const [clientToday, setClientToday] = useState<Date | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<number>>(new Set());
  const [isUpdatingStatus, startUpdateTransition] = useTransition();

  useEffect(() => {
    setClientToday(startOfDay(new Date()));
  }, []);

  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer =>
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_id.includes(searchTerm)
    );

    if (overdueFilter !== 'all' && clientToday) { 
      filtered = filtered.filter(customer => {
        const monthsOverdue = calculateMonthsOverdue(customer.date_next_payment, clientToday);
        switch (overdueFilter) {
          case 'ontime':
            return monthsOverdue <= 0 && customer.is_active; 
          case 'due': 
            return monthsOverdue <= 0 && !customer.is_active; 
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
  }, [customers, searchTerm, overdueFilter, clientToday]);

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
    setCurrentPage(1); 
    setSelectedCustomerIds(new Set()); // Clear selection when filter or search term changes
  }, [searchTerm, overdueFilter]);

  const handleToggleSelectCustomer = (customerId: number, isSelected: boolean) => {
    setSelectedCustomerIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (isSelected) {
        newSelectedIds.add(customerId);
      } else {
        newSelectedIds.delete(customerId);
      }
      return newSelectedIds;
    });
  };

  const handleToggleSelectAllFilteredCustomers = (isSelected: boolean) => {
    if (isSelected) {
      const allFilteredIds = filteredCustomers.map(c => c.id);
      setSelectedCustomerIds(new Set(allFilteredIds));
    } else {
      setSelectedCustomerIds(new Set());
    }
  };
  
  const areAllFilteredCustomersSelected = useMemo(() => {
    if (filteredCustomers.length === 0) return false;
    return filteredCustomers.every(c => selectedCustomerIds.has(c.id));
  }, [filteredCustomers, selectedCustomerIds]);

  const isAnyFilteredCustomerSelected = useMemo(() => {
    if (filteredCustomers.length === 0 || selectedCustomerIds.size === 0) return false;
    return !areAllFilteredCustomersSelected && filteredCustomers.some(c => selectedCustomerIds.has(c.id));
  }, [filteredCustomers, selectedCustomerIds, areAllFilteredCustomersSelected]);


  const updateSelectedCustomersStatus = async (newStatus: boolean) => {
    if (selectedCustomerIds.size === 0) {
      toast({
        title: "Ningún cliente seleccionado",
        description: "Por favor, selecciona al menos un cliente.",
        variant: "destructive",
      });
      return;
    }

    const selectedPlates = customers
      .filter(c => selectedCustomerIds.has(c.id))
      .map(c => c.license_plate);

    if (selectedPlates.length === 0) {
      toast({
        title: "Error",
        description: "No se encontraron las matrículas de los clientes seleccionados.",
        variant: "destructive",
      });
      return;
    }

    const platesParam = encodeURIComponent(selectedPlates.join(','));
    const targetStatusParam = newStatus ? 'active' : 'inactive';
    const apiUrl = `https://n8n.vemontech.com/webhook/d51389da-1775-4ead-a4f5-3dca196ee3fb?accion=by-plate&plate=${platesParam}&target_status=${targetStatusParam}`;

    startUpdateTransition(async () => {
      try {
        const response = await fetch(apiUrl, { cache: 'no-store' });

        if (!response.ok) {
          let errorDetails = `Error del servidor: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorDetails = errorData.message;
            } else if (errorData && typeof errorData === 'string') {
              errorDetails = errorData;
            } else if (errorData && errorData.error) { // Handle cases where error is in an "error" field
              errorDetails = errorData.error;
            }
          } catch (jsonError) {
            // Ignore if error response is not JSON or structured differently
          }
          throw new Error(errorDetails);
        }

        const result = await response.json();

        if (result.success === true) { // Explicitly check for true
          setCustomers(prevCustomers =>
            prevCustomers.map(c =>
              selectedCustomerIds.has(c.id) ? { ...c, is_active: newStatus } : c
            )
          );
          toast({
            title: `Cuentas ${newStatus ? 'Activadas' : 'Desactivadas'}`,
            description: `${selectedPlates.length} cuenta(s) ha(n) sido ${newStatus ? 'activada(s)' : 'desactivada(s)'} exitosamente.`,
          });
          setSelectedCustomerIds(new Set()); // Clear selection
        } else {
          throw new Error(result.message || result.error || "El servidor indicó un fallo pero no proporcionó detalles específicos.");
        }
      } catch (error: any) {
        console.error("Error updating customer status:", error);
        toast({
          title: "Error al actualizar estado",
          description: (error.message && error.message.length < 150 ? error.message : "No se pudo completar la operación. Verifica la consola para más detalles o inténtalo de nuevo."),
          variant: "destructive",
        });
      }
    });
  };


  return (
    <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
            <Select value={overdueFilter} onValueChange={setOverdueFilter} disabled={!clientToday}>
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
          {selectedCustomerIds.size > 0 && (
            <div className="mt-4 flex space-x-2">
              <Button 
                onClick={() => updateSelectedCustomersStatus(true)} 
                variant="outline"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Activar Seleccionados ({selectedCustomerIds.size})
              </Button>
              <Button 
                onClick={() => updateSelectedCustomersStatus(false)} 
                variant="outline"
                disabled={isUpdatingStatus}
              >
                 {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Desactivar Seleccionados ({selectedCustomerIds.size})
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <CustomerTable 
            customers={paginatedCustomers} 
            onViewDetails={handleViewDetails}
            clientToday={clientToday}
            selectedCustomerIds={selectedCustomerIds}
            onSelectCustomer={handleToggleSelectCustomer}
            onSelectAllFilteredCustomers={handleToggleSelectAllFilteredCustomers}
            areAllFilteredCustomersSelected={areAllFilteredCustomersSelected}
            isAnyFilteredCustomerSelected={isAnyFilteredCustomerSelected}
          />
          {paginatedCustomers.length > 0 && totalPages > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
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


    

"use client";

import type { Customer } from '@/types/customer';
import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { CustomerTable } from './customer-table';
import { PaginationControls } from './pagination-controls';
import { CustomerDetailModal } from './customer-detail-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { differenceInMonths, startOfDay } from 'date-fns';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'; // Import RefreshCw

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
  const [isBatchUpdatingStatus, startBatchUpdateTransition] = useTransition();
  const [isRefreshingList, startRefreshTransition] = useTransition(); // New transition for refreshing
  const router = useRouter(); // useRouter hook

  useEffect(() => {
    setClientToday(startOfDay(new Date()));
  }, []);

  useEffect(() => {
    setCustomers(initialCustomers);
    // Reset pagination and selection when initialCustomers change (e.g., after refresh)
    setCurrentPage(1);
    setSelectedCustomerIds(new Set());
  }, [initialCustomers]);

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
    setSelectedCustomerIds(new Set()); 
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
      const allFilteredIds = new Set(filteredCustomers.map(c => c.id));
      setSelectedCustomerIds(allFilteredIds);
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
    const selectedCountInFiltered = filteredCustomers.filter(c => selectedCustomerIds.has(c.id)).length;
    return selectedCountInFiltered > 0 && selectedCountInFiltered < filteredCustomers.length;
  }, [filteredCustomers, selectedCustomerIds]);


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

    startBatchUpdateTransition(async () => {
      try {
        const response = await fetch(apiUrl, { cache: 'no-store' });

        if (!response.ok) {
          let errorDetails = `Error del servidor: ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetails = errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (jsonError) {
            // Ignore if error response is not JSON
          }
          throw new Error(errorDetails);
        }

        const result = await response.json();
        
        const successfullyUpdatedPlates: string[] = result.success && Array.isArray(result.success) ? result.success : [];
        const failedToUpdatePlates: string[] = result.error && Array.isArray(result.error) ? result.error : [];

        if (successfullyUpdatedPlates.length > 0) {
          setCustomers(prevCustomers =>
            prevCustomers.map(c =>
              successfullyUpdatedPlates.includes(c.license_plate)
                ? { ...c, is_active: newStatus }
                : c
            )
          );
        }

        let toastTitle = "";
        let toastDescription = "";
        let toastVariant: "default" | "destructive" = "default";

        if (successfullyUpdatedPlates.length > 0 && failedToUpdatePlates.length === 0) {
          toastTitle = `Cuentas ${newStatus ? 'Activadas' : 'Desactivadas'}`;
          toastDescription = `${successfullyUpdatedPlates.length} cuenta(s) ${newStatus ? 'activada(s)' : 'desactivada(s)'} exitosamente: ${successfullyUpdatedPlates.join(', ')}.`;
        } else if (successfullyUpdatedPlates.length === 0 && failedToUpdatePlates.length > 0) {
          toastTitle = "Error al Actualizar Cuentas";
          toastDescription = `No se pudo(ieron) actualizar ${failedToUpdatePlates.length} cuenta(s): ${failedToUpdatePlates.join(', ')}.`;
          toastVariant = "destructive";
        } else if (successfullyUpdatedPlates.length > 0 && failedToUpdatePlates.length > 0) {
          toastTitle = "Actualización Parcial";
          toastDescription = `Éxito (${successfullyUpdatedPlates.length}): ${successfullyUpdatedPlates.join(', ')} ${newStatus ? 'activada(s)' : 'desactivada(s)'}. Fallo (${failedToUpdatePlates.length}): ${failedToUpdatePlates.join(', ')} no se pudo(ieron) actualizar.`;
        } else if (result.success === false && result.message) {
            toastTitle = "Error de API";
            toastDescription = result.message;
            toastVariant = "destructive";
        } else { 
          toastTitle = "Sin Cambios Efectuados";
          toastDescription = "La operación no afectó a ninguna de las cuentas seleccionadas o la API no devolvió detalles específicos.";
          toastVariant = "default"; 
        }
        
        toast({
          title: toastTitle,
          description: toastDescription.trim(),
          variant: toastVariant,
          duration: 7000,
        });

        setSelectedCustomerIds(new Set());

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

  const handleRefreshCustomers = () => {
    startRefreshTransition(() => {
      router.refresh();
      // Optionally, show a toast that refresh has started
      // toast({ title: "Actualizando lista...", description: "Obteniendo los datos más recientes."});
      // A success/error toast for the refresh itself is harder here as router.refresh() doesn't return a promise
      // that resolves when the data is fully loaded and UI updated. The loading state on the button is the primary feedback.
    });
  };

  return (
    <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Gestión de Clientes</CardTitle>
          <CardDescription>Filtra y gestiona los clientes y el estado de sus pagos.</CardDescription>
           <div className="mt-4 flex flex-col md:flex-row flex-wrap items-end gap-4">
            <div className="flex-grow md:max-w-sm min-w-[200px]">
              <Input
                type="text"
                placeholder="Buscar por nombre, matrícula o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-grow md:max-w-sm min-w-[200px]">
              <Select value={overdueFilter} onValueChange={setOverdueFilter} disabled={!clientToday}>
                <SelectTrigger className="w-full">
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
            <div>
              <Button 
                onClick={handleRefreshCustomers}
                variant="outline"
                disabled={isRefreshingList || !clientToday}
                aria-label="Actualizar lista de clientes"
              >
                {isRefreshingList ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Actualizar
              </Button>
            </div>
          </div>
          {selectedCustomerIds.size > 0 && (
            <div className="mt-4 flex space-x-2">
              <Button 
                onClick={() => updateSelectedCustomersStatus(true)} 
                variant="outline"
                disabled={isBatchUpdatingStatus}
              >
                {isBatchUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Activar Seleccionados ({selectedCustomerIds.size})
              </Button>
              <Button 
                onClick={() => updateSelectedCustomersStatus(false)} 
                variant="outline"
                disabled={isBatchUpdatingStatus}
              >
                 {isBatchUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
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
    

    
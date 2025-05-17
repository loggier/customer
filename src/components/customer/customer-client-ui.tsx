"use client";

import type { Customer } from '@/types/customer';
import React, { useState, useMemo } from 'react';
import { CustomerTable } from './customer-table';
import { PaginationControls } from './pagination-controls';
import { CustomerDetailModal } from './customer-detail-modal';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerClientUIProps {
  initialCustomers: Customer[];
}

const ITEMS_PER_PAGE = 5;

export function CustomerClientUI({ initialCustomers }: CustomerClientUIProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(customer =>
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_id.includes(searchTerm)
    );
  }, [customers, searchTerm]);

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
  
  // Reset to page 1 when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Customer Management</CardTitle>
           <div className="mt-4">
            <Input
              type="text"
              placeholder="Search by name, license plate, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <CustomerTable customers={paginatedCustomers} onViewDetails={handleViewDetails} />
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

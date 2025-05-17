import { fetchCustomers, mockCustomers } from '@/lib/mock-data'; // Using mock data for now
import { CustomerClientUI } from '@/components/customer/customer-client-ui';

// This is a server component
export default async function HomePage() {
  // In a real app, you'd fetch from your API:
  // const { data: customers } = await fetchCustomersFromApi();
  // For now, using mock data:
  // const { data: customers } = await fetchCustomers(); // if using the async mock
  const customers = mockCustomers; // direct mock data for simplicity

  return (
    <CustomerClientUI initialCustomers={customers} />
  );
}


export const dynamic = 'force-dynamic';

import type { Customer, ApiResponse } from '@/types/customer';
import { CustomerClientUI } from '@/components/customer/customer-client-ui';

async function fetchCustomersFromApi(): Promise<Customer[]> {
  const API_URL = "https://n8n.vemontech.com/webhook/d51389da-1775-4ead-a4f5-3dca196ee3fb?accion=memberships";
  try {
    const response = await fetch(API_URL, { cache: 'no-store' }); // 'no-store' para asegurar datos frescos en cada carga
    
    if (!response.ok) {
      console.error("Error al obtener clientes de la API:", response.status, response.statusText);
      // Podrías lanzar un error aquí para que sea capturado por un Error Boundary si tienes uno configurado.
      // O devolver un array vacío para que la UI muestre "No se encontraron clientes".
      return [];
    }

    const apiResponse: ApiResponse = await response.json();

    if (apiResponse.success && Array.isArray(apiResponse.data)) {
      // La API no incluye 'is_active', así que lo añadimos con un valor por defecto.
      // La UI permitirá al usuario cambiar este estado.
      return apiResponse.data.map(customer => ({
        ...customer,
        is_active: true, // Por defecto, todos los clientes de la API se consideran activos.
      }));
    } else {
      console.error("Respuesta de la API no exitosa o formato de datos incorrecto:", apiResponse);
      return [];
    }
  } catch (error) {
    console.error("Fallo al intentar obtener clientes de la API:", error);
    // Considera un manejo de errores más robusto aquí para producción.
    return [];
  }
}

// Este es un Server Component
export default async function HomePage() {
  const customers = await fetchCustomersFromApi();

  return (
    <CustomerClientUI initialCustomers={customers} />
  );
}

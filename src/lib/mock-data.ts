import type { Customer } from '@/types/customer';

export const mockCustomers: Customer[] = [
  {
    id: 399,
    customer_name: "CHOQUEHUANCA NUÑEZ ROCIO MILAGROS",
    customer_id: "191",
    license_plate: "X4V-928",
    date_init: "2025-03-30T22:00:00.000Z",
    date_next_payment: "2026-03-30T22:00:00.000Z",
    type_period: "year",
    count_period: 1,
    value: "432",
    total: 0,
    apply_notyfication: 1,
    phones: "[\"981900200\"]",
    created_at: "2025-04-30T10:34:26.000Z",
    updated_at: "2025-04-30T10:34:26.000Z",
    nv_pendings: 0,
    is_active: true,
  },
  {
    id: 400,
    customer_name: "PEREZ GONZALES JUAN CARLOS",
    customer_id: "205",
    license_plate: "A1B-123",
    date_init: "2024-01-15T10:00:00.000Z",
    date_next_payment: "2024-01-15T10:00:00.000Z", // Vencido significativamente
    type_period: "year",
    count_period: 1,
    value: "500",
    total: 0,
    apply_notyfication: 1,
    phones: "[\"999888777\", \"911222333\"]",
    created_at: "2024-01-10T09:20:15.000Z",
    updated_at: "2024-06-01T11:45:00.000Z",
    nv_pendings: 2,
    is_active: false, // Inicia inactivo por estar vencido
  },
  {
    id: 401,
    customer_name: "RAMIREZ LOPEZ ANA SOFIA",
    customer_id: "310",
    license_plate: "C2D-456",
    date_init: "2024-07-01T14:30:00.000Z",
    date_next_payment: "2024-08-01T14:30:00.000Z", // Próximo a vencer o al día (depende de fecha actual)
    type_period: "month",
    count_period: 1,
    value: "150",
    total: 0,
    apply_notyfication: 0,
    phones: "[\"977666555\"]",
    created_at: "2024-06-25T18:00:42.000Z",
    updated_at: "2024-06-25T18:00:42.000Z",
    nv_pendings: 0,
    is_active: true,
  },
  {
    id: 402,
    customer_name: "TORRES VARGAS LUIS MIGUEL",
    customer_id: "415",
    license_plate: "E3F-789",
    date_init: "2023-11-10T08:00:00.000Z",
    date_next_payment: "2023-11-10T08:00:00.000Z", // Muy vencido
    type_period: "year",
    count_period: 1,
    value: "380",
    total: 0,
    apply_notyfication: 1,
    phones: "[\"966555444\"]",
    created_at: "2023-11-05T12:10:55.000Z",
    updated_at: "2024-05-15T16:30:20.000Z",
    nv_pendings: 1,
    is_active: false, // Inicia inactivo por estar muy vencido
  },
  {
    id: 403,
    customer_name: "GUTIERREZ FLORES MARIA ELENA",
    customer_id: "520",
    license_plate: "G4H-012",
    date_init: "2024-02-20T16:00:00.000Z",
    date_next_payment: "2025-02-20T16:00:00.000Z", // No vencido
    type_period: "year",
    count_period: 1,
    value: "600",
    total: 0,
    apply_notyfication: 1,
    phones: "[\"955444333\", \"944333222\"]",
    created_at: "2024-02-15T10:05:30.000Z",
    updated_at: "2024-02-15T10:05:30.000Z",
    nv_pendings: 0,
    is_active: true,
  },
  {
    id: 404,
    customer_name: "DIAZ MENDOZA CARLOS ALBERTO",
    customer_id: "625",
    license_plate: "I5J-345",
    date_init: "2024-08-05T11:00:00.000Z",
    date_next_payment: "2024-09-05T11:00:00.000Z", // Próximo a vencer o al día
    type_period: "month",
    count_period: 1,
    value: "120",
    total: 0,
    apply_notyfication: 0,
    phones: "[\"933222111\"]",
    created_at: "2024-07-30T14:20:00.000Z",
    updated_at: "2024-07-30T14:20:00.000Z",
    nv_pendings: 0,
    is_active: true,
  }
];

// Simulate API fetch
export async function fetchCustomers(): Promise<{ data: Customer[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockCustomers });
    }, 500); // Simulate network delay
  });
}


export interface Customer {
  id: number;
  customer_name: string;
  customer_id: string;
  license_plate: string;
  date_init: string;
  date_next_payment: string;
  type_period: "year" | "month" | "day"; // Assuming other types might exist
  count_period: number;
  value: string; // This is a string in the example, might need parsing to number
  total: number;
  apply_notyfication: 0 | 1;
  phones: string; // Stringified JSON array
  created_at: string;
  updated_at: string;
  nv_pendings: number;
}

export interface ApiResponse {
  success: boolean;
  data: Customer[];
}

// Type for a single customer detail response (if API differs for single item)
export interface ApiSingleCustomerResponse {
  success: boolean;
  data: Customer;
}

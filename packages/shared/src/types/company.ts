export interface Company {
  id: string;
  name: string;
  siret: string;
  sector: string;
  employee_count: number;
  has_physical_site: boolean;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  company_id: string;
  name: string;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  is_main: boolean;
  created_at: string;
}

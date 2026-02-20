import { UserRole } from './enums';

export interface Profile {
  id: string;
  user_id: string;
  company_id: string | null;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  company_id: string | null;
  first_name: string;
  last_name: string;
}

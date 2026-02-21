export class CreateRegistreDto {
  type: string;
  name: string;
  description?: string;
  site_id?: string;
}

export class UpdateRegistreDto {
  name?: string;
  description?: string;
  is_active?: boolean;
}

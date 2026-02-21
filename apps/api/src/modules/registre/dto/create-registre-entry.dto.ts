export class CreateRegistreEntryDto {
  data: Record<string, unknown>;
  expires_at?: string | null;
}

export class UpdateRegistreEntryDto {
  data?: Record<string, unknown>;
  expires_at?: string | null;
  is_archived?: boolean;
}

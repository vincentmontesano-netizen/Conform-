import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString, IsEmail } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  poste?: string;

  @IsOptional()
  @IsString()
  departement?: string;

  @IsDateString()
  date_entree: string;

  @IsOptional()
  @IsDateString()
  date_sortie?: string;

  @IsOptional()
  @IsString()
  type_contrat?: string;

  @IsOptional()
  @IsString()
  site_id?: string;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  poste?: string;

  @IsOptional()
  @IsString()
  departement?: string;

  @IsOptional()
  @IsDateString()
  date_entree?: string;

  @IsOptional()
  @IsDateString()
  date_sortie?: string;

  @IsOptional()
  @IsString()
  type_contrat?: string;

  @IsOptional()
  @IsString()
  site_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

import { IsString, IsNumber, IsBoolean, IsOptional, Length, Min, Matches } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @Length(14, 14, { message: 'Le SIRET doit contenir exactement 14 chiffres' })
  @Matches(/^\d{14}$/, { message: 'Le SIRET ne doit contenir que des chiffres' })
  siret: string;

  @IsString()
  sector: string;

  @IsNumber()
  @Min(0)
  employee_count: number;

  @IsBoolean()
  @IsOptional()
  has_physical_site?: boolean;
}

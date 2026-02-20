import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  sector?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  employee_count?: number;

  @IsBoolean()
  @IsOptional()
  has_physical_site?: boolean;
}

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateSiteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postal_code?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  employee_count?: number;
}

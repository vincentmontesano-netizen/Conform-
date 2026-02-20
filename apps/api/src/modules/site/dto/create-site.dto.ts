import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

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

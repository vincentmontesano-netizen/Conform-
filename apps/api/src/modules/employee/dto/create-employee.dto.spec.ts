import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateEmployeeDto, UpdateEmployeeDto } from './create-employee.dto';

describe('CreateEmployeeDto', () => {
  function toDto(data: Record<string, any>) {
    return plainToInstance(CreateEmployeeDto, data);
  }

  it('should pass with valid required fields', async () => {
    const dto = toDto({
      nom: 'Dupont',
      prenom: 'Jean',
      date_entree: '2024-01-15',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with all fields', async () => {
    const dto = toDto({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@test.com',
      telephone: '0601020304',
      poste: 'Technicien',
      departement: 'Production',
      date_entree: '2024-01-15',
      date_sortie: '2025-12-31',
      type_contrat: 'cdi',
      site_id: 'site-uuid',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail without nom', async () => {
    const dto = toDto({
      prenom: 'Jean',
      date_entree: '2024-01-15',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'nom')).toBe(true);
  });

  it('should fail without prenom', async () => {
    const dto = toDto({
      nom: 'Dupont',
      date_entree: '2024-01-15',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'prenom')).toBe(true);
  });

  it('should fail without date_entree', async () => {
    const dto = toDto({
      nom: 'Dupont',
      prenom: 'Jean',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date_entree')).toBe(true);
  });

  it('should fail with invalid email', async () => {
    const dto = toDto({
      nom: 'Dupont',
      prenom: 'Jean',
      date_entree: '2024-01-15',
      email: 'not-an-email',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail with invalid date format', async () => {
    const dto = toDto({
      nom: 'Dupont',
      prenom: 'Jean',
      date_entree: 'not-a-date',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date_entree')).toBe(true);
  });
});

describe('UpdateEmployeeDto', () => {
  function toDto(data: Record<string, any>) {
    return plainToInstance(UpdateEmployeeDto, data);
  }

  it('should pass with empty update (all optional)', async () => {
    const dto = toDto({});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with partial update', async () => {
    const dto = toDto({
      poste: 'Chef equipe',
      is_active: false,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid email on update', async () => {
    const dto = toDto({
      email: 'bad-email',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail with non-boolean is_active', async () => {
    const dto = toDto({
      is_active: 'yes',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'is_active')).toBe(true);
  });
});

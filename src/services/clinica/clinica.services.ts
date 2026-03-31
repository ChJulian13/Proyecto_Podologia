import crypto from 'crypto';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repositore.js';
import { type CreateClinicaDTO, type UpdateClinicaDTO, type ClinicaRow } from '../../domain/clinica/clinica.domain.js';

export class ClinicaService {
  private clinicaRepository = new ClinicaRepository();

  async getAll(): Promise<ClinicaRow[]> {
    return await this.clinicaRepository.findAllActivas();
  }

  async getById(id: string): Promise<ClinicaRow> {
    const clinica = await this.clinicaRepository.findById(id);
    if (!clinica) throw new Error('CLINICA_NOT_FOUND');
    return clinica;
  }

  async create(data: CreateClinicaDTO): Promise<ClinicaRow> {
    // Generamos el UUID V4 nativamente en Node.js
    const newId = crypto.randomUUID(); 
    
    await this.clinicaRepository.create(
      newId, 
      data.nombre, 
      data.telefono ?? null, 
      data.correo ?? null
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateClinicaDTO): Promise<ClinicaRow> {
    const existing = await this.clinicaRepository.findById(id);
    if (!existing) throw new Error('CLINICA_NOT_FOUND');

    const newNombre = data.nombre ?? existing.nombre;
    const newTelefono = data.telefono !== undefined ? data.telefono : existing.telefono;
    const newCorreo = data.correo !== undefined ? data.correo : existing.correo;

    await this.clinicaRepository.update(id, newNombre, newTelefono, newCorreo);
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.clinicaRepository.findById(id);
    if (!existing) throw new Error('CLINICA_NOT_FOUND');

    await this.clinicaRepository.softDelete(id);
  }
}
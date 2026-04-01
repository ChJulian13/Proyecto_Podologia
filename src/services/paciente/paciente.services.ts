import crypto from 'crypto';
import { PacienteRepository } from '../../repositories/paciente/paciente.repositories.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repositore.js';
import { mapPacienteRowToEntity, type CreatePacienteDTO, type UpdatePacienteDTO, type PacienteEntity } from '../../domain/paciente/paciente.domain.js';

export class PacienteService {
  private pacienteRepository = new PacienteRepository();
  private clinicaRepository = new ClinicaRepository();

  async getAllByClinica(clinicaId: string): Promise<PacienteEntity[]> {
    const rows = await this.pacienteRepository.findAllByClinica(clinicaId);
    return rows.map(mapPacienteRowToEntity);
  }

  async getById(id: string): Promise<PacienteEntity> {
    const row = await this.pacienteRepository.findById(id);
    if (!row) throw new Error('PACIENTE_NOT_FOUND');
    return mapPacienteRowToEntity(row);
  }

  async create(data: CreatePacienteDTO): Promise<PacienteEntity> {
    const clinica = await this.clinicaRepository.findById(data.clinica_id);
    if (!clinica) throw new Error('CLINICA_NOT_FOUND');

    const newId = crypto.randomUUID();

    await this.pacienteRepository.create(
      newId,
      data.clinica_id,
      data.nombre,
      data.primer_apellido,
      data.segundo_apellido ?? null,
      data.telefono, // Cambió a obligatorio según BD
      data.correo ?? null,
      data.fecha_nacimiento ?? null,
      data.direccion ?? null,
      data.discapacidad ?? null,
      data.alergias ?? null,
      data.notas ?? null
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdatePacienteDTO): Promise<PacienteEntity> {
    const existingRow = await this.pacienteRepository.findById(id);
    if (!existingRow) throw new Error('PACIENTE_NOT_FOUND');

    const newNombre = data.nombre ?? existingRow.nombre;
    const newPrimerApellido = data.primer_apellido ?? existingRow.primer_apellido;
    const newSegundoApellido = data.segundo_apellido !== undefined ? data.segundo_apellido : existingRow.segundo_apellido;
    const newTelefono = data.telefono ?? existingRow.telefono;
    const newCorreo = data.correo !== undefined ? data.correo : existingRow.correo;
    const newFechaNacimiento = data.fecha_nacimiento !== undefined ? data.fecha_nacimiento : existingRow.fecha_nacimiento;
    const newDireccion = data.direccion !== undefined ? data.direccion : existingRow.direccion;
    const newDiscapacidad = data.discapacidad !== undefined ? data.discapacidad : existingRow.discapacidad;
    const newAlergias = data.alergias !== undefined ? data.alergias : existingRow.alergias;
    const newNotas = data.notas !== undefined ? data.notas : existingRow.notas;

    await this.pacienteRepository.update(
      id, 
      newNombre, 
      newPrimerApellido, 
      newSegundoApellido, 
      newTelefono, 
      newCorreo, 
      newFechaNacimiento,
      newDireccion,
      newDiscapacidad,
      newAlergias,
      newNotas
    );
    
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.pacienteRepository.findById(id);
    if (!existing) throw new Error('PACIENTE_NOT_FOUND');

    await this.pacienteRepository.softDelete(id);
  }
}
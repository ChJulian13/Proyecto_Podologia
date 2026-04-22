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

    // Enviamos un objeto que cumple con Partial<PacienteRow>
    await this.pacienteRepository.create({
      id: newId,
      clinica_id: data.clinica_id,
      nombre: data.nombre,
      primer_apellido: data.primer_apellido,
      segundo_apellido: data.segundo_apellido ?? null,
      telefono: data.telefono,
      correo: data.correo ?? null,
      
      // Nuevos campos de dirección estructurada
      codigo_postal: data.codigoPostal ?? null,
      estado: data.estado ?? null,
      municipio: data.municipio ?? null,
      ciudad: data.ciudad ?? null,
      colonia: data.colonia ?? null,
      calle_y_numero: data.calleYNumero ?? null,
      
      fecha_nacimiento: data.fecha_nacimiento ?? null,
      discapacidad: data.discapacidad ?? null,
      alergias: data.alergias ?? null,
      notas: data.notas ?? null
    });

    return await this.getById(newId);
  }

  async update(id: string, data: UpdatePacienteDTO): Promise<PacienteEntity> {
    const existingRow = await this.pacienteRepository.findById(id);
    if (!existingRow) throw new Error('PACIENTE_NOT_FOUND');

    // Enviamos el ID y un objeto con los datos a actualizar
    await this.pacienteRepository.update(id, {
      nombre: data.nombre ?? existingRow.nombre,
      primer_apellido: data.primer_apellido ?? existingRow.primer_apellido,
      segundo_apellido: data.segundo_apellido !== undefined ? data.segundo_apellido : existingRow.segundo_apellido,
      telefono: data.telefono ?? existingRow.telefono,
      correo: data.correo !== undefined ? data.correo : existingRow.correo,
      
      // Nuevos campos de dirección estructurada
      codigo_postal: data.codigoPostal !== undefined ? data.codigoPostal : existingRow.codigo_postal,
      estado: data.estado !== undefined ? data.estado : existingRow.estado,
      municipio: data.municipio !== undefined ? data.municipio : existingRow.municipio,
      ciudad: data.ciudad !== undefined ? data.ciudad : existingRow.ciudad,
      colonia: data.colonia !== undefined ? data.colonia : existingRow.colonia,
      calle_y_numero: data.calleYNumero !== undefined ? data.calleYNumero : existingRow.calle_y_numero,

      fecha_nacimiento: data.fecha_nacimiento !== undefined ? data.fecha_nacimiento : existingRow.fecha_nacimiento,
      discapacidad: data.discapacidad !== undefined ? data.discapacidad : existingRow.discapacidad,
      alergias: data.alergias !== undefined ? data.alergias : existingRow.alergias,
      notas: data.notas !== undefined ? data.notas : existingRow.notas
    });
    
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.pacienteRepository.findById(id);
    if (!existing) throw new Error('PACIENTE_NOT_FOUND');

    await this.pacienteRepository.softDelete(id);
  }
}
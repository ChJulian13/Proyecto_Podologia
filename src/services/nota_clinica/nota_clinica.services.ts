import crypto from 'crypto';
import { NotaClinicaRepository } from '../../repositories/nota_clinica/nota_clinica.repositories.js';
import { PacienteRepository } from '../../repositories/paciente/paciente.repositories.js';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repositore.js';
import { CitaRepository } from '../../repositories/cita/cita.repositories.js';
import { mapNotaClinicaRowToEntity, type CreateNotaClinicaDTO, type UpdateNotaClinicaDTO, type NotaClinicaEntity } from '../../domain/nota_clinica/nota_clinica.domain.js';

export class NotaClinicaService {
  private notaRepository = new NotaClinicaRepository();
  private pacienteRepository = new PacienteRepository();
  private usuarioRepository = new UsuarioRepository();
  private citaRepository = new CitaRepository();

  async getHistorialByPaciente(pacienteId: string): Promise<NotaClinicaEntity[]> {
    // 1. Verificamos que el paciente exista
    const paciente = await this.pacienteRepository.findById(pacienteId);
    if (!paciente) throw new Error('PACIENTE_NOT_FOUND');

    const rows = await this.notaRepository.findByPacienteId(pacienteId);
    return rows.map(mapNotaClinicaRowToEntity);
  }

  async getById(id: string): Promise<NotaClinicaEntity> {
    const row = await this.notaRepository.findById(id);
    if (!row) throw new Error('NOTA_NOT_FOUND');
    return mapNotaClinicaRowToEntity(row);
  }

  async create(data: CreateNotaClinicaDTO): Promise<NotaClinicaEntity> {
    // 1. Validaciones de Integridad Estricta
    const paciente = await this.pacienteRepository.findById(data.paciente_id);
    if (!paciente || paciente.clinica_id !== data.clinica_id) throw new Error('PACIENTE_INVALIDO');

    const podologo = await this.usuarioRepository.findById(data.podologo_id);
    if (!podologo || podologo.clinica_id !== data.clinica_id) throw new Error('PODOLOGO_INVALIDO');

    // Si la nota se generó desde una cita, validamos que cuadren los datos
    if (data.cita_id) {
      const cita = await this.citaRepository.findById(data.cita_id);
      if (!cita || cita.clinica_id !== data.clinica_id || cita.paciente_id !== data.paciente_id) {
        throw new Error('CITA_INVALIDA');
      }
    }

    // 2. Generación y guardado
    const newId = crypto.randomUUID();

    await this.notaRepository.create(
      newId,
      data.clinica_id,
      data.paciente_id,
      data.cita_id ?? null,
      data.podologo_id,
      data.fecha_nota ?? null,
      data.notas ?? null,
      data.diagnostico ?? null,
      data.tratamiento ?? null
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateNotaClinicaDTO): Promise<NotaClinicaEntity> {
    const existingRow = await this.notaRepository.findById(id);
    if (!existingRow) throw new Error('NOTA_NOT_FOUND');

    // Solo permitimos actualizar los textos médicos. El paciente, doctor y fechas son inmutables.
    const newNotas = data.notas !== undefined ? data.notas : existingRow.notas;
    const newDiagnostico = data.diagnostico !== undefined ? data.diagnostico : existingRow.diagnostico;
    const newTratamiento = data.tratamiento !== undefined ? data.tratamiento : existingRow.tratamiento;

    await this.notaRepository.update(id, newNotas, newDiagnostico, newTratamiento);
    return await this.getById(id);
  }

  async getByCitaId(citaId: string): Promise<NotaClinicaEntity | null> {
    const row = await this.notaRepository.findByCitaId(citaId);
    if (!row) return null; // Retornamos null para que el controlador decida qué hacer
    return mapNotaClinicaRowToEntity(row);
  }
}
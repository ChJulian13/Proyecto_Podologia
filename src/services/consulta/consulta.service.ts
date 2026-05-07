import crypto from 'crypto';
import { ConsultaRepository } from '../../repositories/consulta/consulta.repository.js';
import { NotFoundError } from '../../common/errors/domain.errors.js';
import {
  mapConsultaRowToEntity,
  mapRecetaRowToEntity,
  type CreateConsultaDTO,
  type CreateConsultaRecetaDTO,
  type UpdateConsultaDTO,
  type ConsultaEntity,
  type ConsultaRecetaEntity,
} from '../../domain/consulta/consulta.domain.js';

export class ConsultaService {
  private consultaRepository = new ConsultaRepository();

  // ── POST /api/consultas — Creación transaccional ──────────────────────────

  async create(data: CreateConsultaDTO): Promise<string> {
    const newId = crypto.randomUUID();
    await this.consultaRepository.createWithTransaction(data, newId);
    return newId;
  }

  // ── GET /api/consultas/:id — Detalle completo con recetas ─────────────────

  async getById(id: string): Promise<ConsultaEntity> {
    const row = await this.consultaRepository.findById(id);
    if (!row) throw new NotFoundError('Consulta');

    const recetas = await this.consultaRepository.findRecetasByConsultaId(id);
    return mapConsultaRowToEntity(row, recetas);
  }

  // ── GET /api/consultas/paciente/:pacienteId — Historial clínico ───────────

  async getByPaciente(pacienteId: string): Promise<ConsultaEntity[]> {
    const rows = await this.consultaRepository.findByPacienteId(pacienteId);

    // Enriquecer cada consulta con sus recetas
    const entities = await Promise.all(
      rows.map(async (row) => {
        const recetas = await this.consultaRepository.findRecetasByConsultaId(row.id);
        return mapConsultaRowToEntity(row, recetas);
      })
    );

    return entities;
  }

  // ── GET /api/consultas/cita/:citaId — Validación de agenda ───────────────

  async getByCita(citaId: string): Promise<ConsultaEntity | null> {
    const row = await this.consultaRepository.findByCitaId(citaId);
    if (!row) return null;

    const recetas = await this.consultaRepository.findRecetasByConsultaId(row.id);
    return mapConsultaRowToEntity(row, recetas);
  }

  // ── PATCH /api/consultas/:id — Actualización parcial ─────────────────────

  async update(id: string, data: UpdateConsultaDTO): Promise<ConsultaEntity> {
    const existing = await this.consultaRepository.findById(id);
    if (!existing) throw new NotFoundError('Consulta');

    await this.consultaRepository.update(id, data);

    const updated = await this.consultaRepository.findById(id);
    const recetas = await this.consultaRepository.findRecetasByConsultaId(id);
    return mapConsultaRowToEntity(updated!, recetas);
  }

  // ── POST /api/consultas/:consultaId/recetas — Agregar receta ─────────────

  async addReceta(
    consultaId: string,
    receta: CreateConsultaRecetaDTO
  ): Promise<ConsultaRecetaEntity> {
    const consulta = await this.consultaRepository.findById(consultaId);
    if (!consulta) throw new NotFoundError('Consulta');

    const recetaId = crypto.randomUUID();
    await this.consultaRepository.addReceta(consultaId, recetaId, receta);

    const newReceta = await this.consultaRepository.findRecetaById(recetaId);
    return mapRecetaRowToEntity(newReceta!);
  }

  // ── DELETE /api/consultas/:consultaId/recetas/:recetaId ──────────────────

  async deleteReceta(consultaId: string, recetaId: string): Promise<void> {
    const consulta = await this.consultaRepository.findById(consultaId);
    if (!consulta) throw new NotFoundError('Consulta');

    const receta = await this.consultaRepository.findRecetaById(recetaId);
    if (!receta || receta.consulta_id !== consultaId) {
      throw new NotFoundError('Receta');
    }

    await this.consultaRepository.deleteReceta(recetaId);
  }
}

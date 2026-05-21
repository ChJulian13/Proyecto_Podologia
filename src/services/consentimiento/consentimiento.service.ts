import crypto from 'crypto';
import { ConsentimientoRepository } from '../../repositories/consentimiento/consentimiento.repository.js';
import { NotFoundError } from '../../common/errors/domain.errors.js';
import {
  mapConsentimientoRowToEntity,
  type CreateConsentimientoDTO,
  type UpdateConsentimientoDTO,
  type ConsentimientoEntity
} from '../../domain/consentimiento/consentimiento.domain.js';

export class ConsentimientoService {
  private repository = new ConsentimientoRepository();

  async getById(id: string): Promise<ConsentimientoEntity> {
    const row = await this.repository.findById(id);
    if (!row) throw new NotFoundError('Consentimiento informado');
    return mapConsentimientoRowToEntity(row);
  }

  async getByPaciente(pacienteId: string): Promise<ConsentimientoEntity[]> {
    const rows = await this.repository.findByPacienteId(pacienteId);
    return rows.map(mapConsentimientoRowToEntity);
  }

  async create(data: CreateConsentimientoDTO): Promise<ConsentimientoEntity> {
    const newId = crypto.randomUUID();
    
    await this.repository.create(
      newId,
      data.clinica_id,
      data.paciente_id,
      data.consulta_id ?? null,
      data.tipo_documento,
      data.estado_firma,
      data.url_documento ?? null
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateConsentimientoDTO): Promise<ConsentimientoEntity> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Consentimiento informado');

    const newEstado = data.estado_firma ?? existing.estado_firma;
    const newUrl = data.url_documento !== undefined ? data.url_documento : existing.url_documento;
    
    let newFechaFirma = existing.fecha_firma;
    if (data.fecha_firma) {
      newFechaFirma = new Date(data.fecha_firma);
    }
    
    const newIp = data.ip_firma !== undefined ? data.ip_firma : existing.ip_firma;

    await this.repository.update(id, newEstado, newUrl, newFechaFirma, newIp);

    return await this.getById(id);
  }
}

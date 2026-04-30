import crypto from 'crypto';
import { ServicioRepository } from '../../repositories/servicio/servicio.repository.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repository.js';
import { NotFoundError } from '../../common/errors/domain.errors.js';
import { mapServicioRowToEntity, type CreateServicioDTO, type UpdateServicioDTO, type ServicioEntity } from '../../domain/servicio/servicio.domain.js';

export class ServicioService {
  private servicioRepository = new ServicioRepository();
  private clinicaRepository = new ClinicaRepository();

  async getAllByClinica(clinicaId: string): Promise<ServicioEntity[]> {
    const rows = await this.servicioRepository.findAllByClinica(clinicaId);
    return rows.map(mapServicioRowToEntity);
  }

  async getById(id: string): Promise<ServicioEntity> {
    const row = await this.servicioRepository.findById(id);
    if (!row) throw new NotFoundError('Servicio');
    return mapServicioRowToEntity(row);
  }

  async create(data: CreateServicioDTO): Promise<ServicioEntity> {
    const clinica = await this.clinicaRepository.findById(data.clinica_id);
    if (!clinica) throw new NotFoundError('Clínica');

    const newId = crypto.randomUUID();

    await this.servicioRepository.create(
      newId,
      data.clinica_id,
      data.nombre,
      data.descripcion ?? null,
      data.duracion_minutos ?? 60,
      data.precio
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateServicioDTO): Promise<ServicioEntity> {
    const existingRow = await this.servicioRepository.findById(id);
    if (!existingRow) throw new NotFoundError('Servicio');

    const newNombre = data.nombre ?? existingRow.nombre;
    const newDescripcion = data.descripcion !== undefined ? data.descripcion : existingRow.descripcion;
    const newDuracionMinutos = data.duracion_minutos ?? existingRow.duracion_minutos;
    const newPrecio = data.precio ?? parseFloat(existingRow.precio);

    await this.servicioRepository.update(id, newNombre, newDescripcion, newDuracionMinutos, newPrecio);
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.servicioRepository.findById(id);
    if (!existing) throw new NotFoundError('Servicio');

    await this.servicioRepository.softDelete(id);
  }
}
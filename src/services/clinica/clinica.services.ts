import crypto from 'crypto';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repositore.js';
import { type CreateClinicaDTO, type UpdateClinicaDTO, type ClinicaRow } from '../../domain/clinica/clinica.domain.js';

export class ClinicaService {
  private clinicaRepository = new ClinicaRepository();

  async getAll(): Promise<ClinicaRow[]> {
    // El SuperAdmin ve todas, activas o inactivas
    return await this.clinicaRepository.findAll(); 
  }

  async getById(id: string): Promise<ClinicaRow> {
    const clinica = await this.clinicaRepository.findById(id);
    if (!clinica) throw new Error('CLINICA_NOT_FOUND');
    return clinica;
  }

  async create(data: CreateClinicaDTO): Promise<ClinicaRow> {
    const newId = crypto.randomUUID(); 
    
    await this.clinicaRepository.create({
      id: newId,
      nombre: data.nombre,
      // Aplicamos el parche ?? null a todos los campos opcionales de Zod
      telefono: data.telefono ?? null,
      correo: data.correo ?? null,
      platform_admin_id: data.platformAdminId ?? null,
      plan_suscripcion_id: data.planSuscripcionId ?? null,
      fecha_vencimiento_suscripcion: data.fechaVencimientoSuscripcion ?? null,
      dominio_personalizado: data.dominioPersonalizado ?? null,
      configuracion_visual: data.configuracionVisual ?? null,
      codigo_postal: data.codigoPostal ?? null,
      estado: data.estado ?? null,
      municipio: data.municipio ?? null,
      ciudad: data.ciudad ?? null,
      colonia: data.colonia ?? null,
      calle_y_numero: data.calleYNumero ?? null
    });

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateClinicaDTO): Promise<ClinicaRow> {
    const existing = await this.clinicaRepository.findById(id);
    if (!existing) throw new Error('CLINICA_NOT_FOUND');

    await this.clinicaRepository.update(id, {
      nombre: data.nombre ?? existing.nombre,
      telefono: data.telefono !== undefined ? data.telefono : existing.telefono,
      correo: data.correo !== undefined ? data.correo : existing.correo,
      plan_suscripcion_id: data.planSuscripcionId !== undefined ? data.planSuscripcionId : existing.plan_suscripcion_id,
      fecha_vencimiento_suscripcion: data.fechaVencimientoSuscripcion !== undefined ? data.fechaVencimientoSuscripcion : existing.fecha_vencimiento_suscripcion,
      dominio_personalizado: data.dominioPersonalizado !== undefined ? data.dominioPersonalizado : existing.dominio_personalizado,
      configuracion_visual: data.configuracionVisual !== undefined ? data.configuracionVisual : existing.configuracion_visual,
      // Conservamos el estado activo si no se pasa uno nuevo en un hipotético campo futuro
      esta_activa: existing.esta_activa,
      codigo_postal: data.codigoPostal !== undefined ? data.codigoPostal : existing.codigo_postal,
      estado: data.estado !== undefined ? data.estado : existing.estado,
      municipio: data.municipio !== undefined ? data.municipio : existing.municipio,
      ciudad: data.ciudad !== undefined ? data.ciudad : existing.ciudad,
      colonia: data.colonia !== undefined ? data.colonia : existing.colonia,
      calle_y_numero: data.calleYNumero !== undefined ? data.calleYNumero : existing.calle_y_numero
    });
    
    return await this.getById(id);
  }

  // Ahora sirve para apagar (soft delete) y encender clínicas
  async toggleStatus(id: string, activar: boolean): Promise<void> {
    const existing = await this.clinicaRepository.findById(id);
    if (!existing) throw new Error('CLINICA_NOT_FOUND');

    await this.clinicaRepository.updateStatus(id, activar);
  }
}
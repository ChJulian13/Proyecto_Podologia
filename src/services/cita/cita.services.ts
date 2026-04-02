import crypto from 'crypto';
import { CitaRepository } from '../../repositories/cita/cita.repositories.js';
import { PacienteRepository } from '../../repositories/paciente/paciente.repositories.js';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repositore.js';
import { ServicioRepository } from '../../repositories/servicio/servicio.repositories.js';
import { mapCitaRowToEntity, type CreateCitaDTO, type UpdateCitaDTO, type CitaEntity } from '../../domain/cita/cita.domain.js';

export class CitaService {
  private citaRepository = new CitaRepository();
  private pacienteRepository = new PacienteRepository();
  private usuarioRepository = new UsuarioRepository();
  private servicioRepository = new ServicioRepository();

  async getAllByClinica(clinicaId: string): Promise<CitaEntity[]> {
    const rows = await this.citaRepository.findAllByClinica(clinicaId);
    return rows.map(mapCitaRowToEntity);
  }

  async getById(id: string): Promise<CitaEntity> {
    const row = await this.citaRepository.findById(id);
    if (!row) throw new Error('CITA_NOT_FOUND');
    return mapCitaRowToEntity(row);
  }

  async create(data: CreateCitaDTO): Promise<CitaEntity> {
    // 1. Validar que las entidades relacionadas existan
    const paciente = await this.pacienteRepository.findById(data.paciente_id);
    if (!paciente || paciente.clinica_id !== data.clinica_id) throw new Error('PACIENTE_INVALIDO');

    const podologo = await this.usuarioRepository.findById(data.podologo_id);
    if (!podologo || podologo.clinica_id !== data.clinica_id) throw new Error('PODOLOGO_INVALIDO');

    if (data.servicio_id) {
      const servicio = await this.servicioRepository.findById(data.servicio_id);
      if (!servicio || servicio.clinica_id !== data.clinica_id) throw new Error('SERVICIO_INVALIDO');
    }

    // 2. Validar choque de horarios (Regla de negocio core)
    // Agregamos segundos ":00" porque MySQL guarda la hora completa
    const horaCompleta = `${data.hora_programada}:00`; 
    const conflicto = await this.citaRepository.findConflict(data.podologo_id, data.fecha_programada, horaCompleta);
    
    if (conflicto) {
      throw new Error('HORARIO_NO_DISPONIBLE');
    }

    // 3. Generar UUID y guardar
    const newId = crypto.randomUUID();

    await this.citaRepository.create(
      newId,
      data.clinica_id,
      data.paciente_id,
      data.podologo_id,
      data.servicio_id ?? null,
      data.fecha_programada,
      horaCompleta,
      data.duracion_minutos ?? 60,
      data.notas ?? null
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateCitaDTO): Promise<CitaEntity> {
    const existingCita = await this.citaRepository.findById(id);
    if (!existingCita) throw new Error('CITA_NOT_FOUND');

    // Mapeo de valores nuevos vs existentes
    const newPacienteId = data.paciente_id ?? existingCita.paciente_id;
    const newPodologoId = data.podologo_id ?? existingCita.podologo_id;
    const newServicioId = data.servicio_id !== undefined ? data.servicio_id : existingCita.servicio_id;
    const newFecha = data.fecha_programada ?? (existingCita.fecha_programada instanceof Date ? existingCita.fecha_programada.toISOString().substring(0, 10) : String(existingCita.fecha_programada));
    
    // Formatear hora si fue enviada, si no, usar la existente
    let newHora = existingCita.hora_programada;
    if (data.hora_programada) {
       newHora = `${data.hora_programada}:00`;
    }

    const newDuracion = data.duracion_minutos ?? existingCita.duracion_minutos;
    const newEstado = data.estado ?? existingCita.estado;
    const newNotas = data.notas !== undefined ? data.notas : existingCita.notas;

    // Si se cambió la fecha, la hora o el doctor, verificar conflictos
    if (data.fecha_programada || data.hora_programada || data.podologo_id) {
      const conflicto = await this.citaRepository.findConflict(newPodologoId, newFecha, newHora, id);
      if (conflicto) throw new Error('HORARIO_NO_DISPONIBLE');
    }

    await this.citaRepository.update(id, newPacienteId, newPodologoId, newServicioId, newFecha, newHora, newDuracion, newEstado, newNotas);
    
    return await this.getById(id);
  }

  async cancelar(id: string): Promise<void> {
    const existing = await this.citaRepository.findById(id);
    if (!existing) throw new Error('CITA_NOT_FOUND');

    await this.citaRepository.cancelar(id);
  }
}
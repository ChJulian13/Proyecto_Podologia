import crypto from 'crypto';
import { CitaRepository } from '../../repositories/cita/cita.repository.js';
import { PacienteRepository } from '../../repositories/paciente/paciente.repository.js';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repository.js';
import { ServicioRepository } from '../../repositories/servicio/servicio.repository.js';
import { mapCitaRowToEntity, type CreateCitaDTO, type UpdateCitaDTO, type CitaEntity } from '../../domain/cita/cita.domain.js';
import { NotFoundError, ConflictError, ValidationError } from '../../common/errors/domain.errors.js';

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
    if (!row) throw new NotFoundError('Cita');
    return mapCitaRowToEntity(row);
  }

  async create(data: CreateCitaDTO): Promise<CitaEntity> {
    // 1. Validar que las entidades relacionadas existan
    const paciente = await this.pacienteRepository.findById(data.paciente_id);
    if (!paciente || paciente.clinica_id !== data.clinica_id) {
      throw new ValidationError([{ path: ['paciente_id'], message: 'El paciente no existe o no pertenece a esta clínica' }]);
    }

    const podologo = await this.usuarioRepository.findById(data.podologo_id);
    if (!podologo || podologo.clinica_id !== data.clinica_id) {
      throw new ValidationError([{ path: ['podologo_id'], message: 'El podólogo no existe o no pertenece a esta clínica' }]);
    }

    if (data.servicio_id) {
      const servicio = await this.servicioRepository.findById(data.servicio_id);
      if (!servicio || servicio.clinica_id !== data.clinica_id) {
        throw new ValidationError([{ path: ['servicio_id'], message: 'El servicio no existe o no pertenece a esta clínica' }]);
      }
    }

    // 2. Validar choque de horarios (Regla de negocio core)
    const horaCompleta = `${data.hora_programada}:00`;
    const conflicto = await this.citaRepository.findConflict(data.podologo_id, data.fecha_programada, horaCompleta);

    if (conflicto) {
      throw new ConflictError('El podólogo ya tiene una cita asignada en ese horario');
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
    if (!existingCita) throw new NotFoundError('Cita');

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
      if (conflicto) throw new ConflictError('El nuevo horario entra en conflicto con otra cita');
    }

    await this.citaRepository.update(id, newPacienteId, newPodologoId, newServicioId, newFecha, newHora, newDuracion, newEstado, newNotas);

    return await this.getById(id);
  }

  async cancelar(id: string): Promise<void> {
    const existing = await this.citaRepository.findById(id);
    if (!existing) throw new NotFoundError('Cita');

    await this.citaRepository.cancelar(id);
  }

  async getTodayCitas(clinicaId: string, usuarioId: string, rol: string): Promise<CitaEntity[]> {
    let rows;

    if (rol === 'PODOLOGO') {
      rows = await this.citaRepository.findToday(clinicaId, usuarioId);
    } else {
      rows = await this.citaRepository.findToday(clinicaId);
    }

    return rows.map(mapCitaRowToEntity);
  }
}
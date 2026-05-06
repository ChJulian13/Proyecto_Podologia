import crypto from 'crypto';
import { pool } from '../../config/database.js';
import { PacienteRepository } from '../../repositories/paciente/paciente.repository.js';
import { CitaRepository } from '../../repositories/cita/cita.repository.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repository.js';
import { ServicioRepository } from '../../repositories/servicio/servicio.repository.js';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repository.js';
import { NotFoundError, ValidationError } from '../../common/errors/domain.errors.js';
import type { CreateCitaRapidaDTO } from '../../domain/cita/cita.domain.js';

export interface AgendaRapidaResult {
    pacienteId: string;
    citaId: string;
}

/**
 * AgendaRapidaService — Use Case / Application Service
 *
 * Responsabilidad única: orquestar la creación atómica de un paciente nuevo
 * y su primera cita en una sola transacción SQL.
 *
 * No hereda lógica de CitaService ni PacienteService para evitar
 * dependencias circulares y doble validación. Habla directamente
 * con los repositorios, que son la fuente de verdad de persistencia.
 */
export class AgendaRapidaService {
    private pacienteRepository = new PacienteRepository();
    private citaRepository = new CitaRepository();
    private clinicaRepository = new ClinicaRepository();
    private servicioRepository = new ServicioRepository();
    private usuarioRepository = new UsuarioRepository();

    async ejecutar(data: CreateCitaRapidaDTO): Promise<AgendaRapidaResult> {
        // ── 1. Validaciones previas a la transacción ──
        // Es importante validar ANTES de abrir la conexión para no retenerla innecesariamente.

        const clinica = await this.clinicaRepository.findById(data.clinica_id);
        if (!clinica) {
            throw new NotFoundError('Clínica');
        }

        const podologo = await this.usuarioRepository.findById(data.podologo_id);
        if (!podologo || podologo.clinica_id !== data.clinica_id) {
            throw new ValidationError([{
                path: ['podologo_id'],
                message: 'El podólogo no existe o no pertenece a esta clínica',
            }]);
        }

        if (data.servicio_id) {
            const servicio = await this.servicioRepository.findById(data.servicio_id);
            if (!servicio || servicio.clinica_id !== data.clinica_id) {
                throw new ValidationError([{
                    path: ['servicio_id'],
                    message: 'El servicio no existe o no pertenece a esta clínica',
                }]);
            }
        }

        // ── 2. Transacción atómica ──
        const connection = await pool.getConnection();
        const nuevoPacienteId = crypto.randomUUID();
        const nuevaCitaId = crypto.randomUUID();

        try {
            await connection.beginTransaction();

            // Paso A: Registrar al paciente exprés (solo datos mínimos obligatorios)
            await this.pacienteRepository.createWithTransaction(
                connection,
                nuevoPacienteId,
                data.clinica_id,
                data.paciente_nuevo.nombre,
                data.paciente_nuevo.primer_apellido,
                data.paciente_nuevo.telefono,
            );

            // Paso B: Agendar la cita vinculada al paciente recién creado
            await this.citaRepository.createWithTransaction(
                connection,
                nuevaCitaId,
                data.clinica_id,
                nuevoPacienteId,
                data.podologo_id,
                data.servicio_id ?? null,
                data.fecha_programada,
                data.hora_programada,
                data.duracion_minutos ?? 60,
                data.notas ?? null,
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        return { pacienteId: nuevoPacienteId, citaId: nuevaCitaId };
    }
}
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { pool } from '../../config/database.js';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repository.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repository.js';
import { NotFoundError, ConflictError, UnauthorizedError } from '../../common/errors/domain.errors.js';
import { mapUsuarioRowToEntity, type CreateUsuarioDTO, type UpdateUsuarioDTO, type UsuarioEntity, type UpdatePasswordDTO } from '../../domain/usuario/usuario.domain.js';

export class UsuarioService {
  private usuarioRepository = new UsuarioRepository();
  private clinicaRepository = new ClinicaRepository();

  async getAllByClinica(clinicaId: string): Promise<UsuarioEntity[]> {
    const rows = await this.usuarioRepository.findAllByClinica(clinicaId);
    
    // Para cada fila, buscamos sus asignaciones completas (ya que un usuario puede tener varias)
    // Pero en esta vista, quizá solo queremos devolver el usuario enriquecido
    const entities = await Promise.all(rows.map(async row => {
       const asignaciones = await this.usuarioRepository.findAsignaciones(row.id);
       return mapUsuarioRowToEntity(row, asignaciones);
    }));

    return entities;
  }

  async getById(id: string): Promise<UsuarioEntity> {
    const row = await this.usuarioRepository.findById(id);
    if (!row) throw new NotFoundError('Usuario');
    
    const asignaciones = await this.usuarioRepository.findAsignaciones(id);
    return mapUsuarioRowToEntity(row, asignaciones);
  }

  async create(data: CreateUsuarioDTO): Promise<UsuarioEntity> {
    // 1. Verificamos que la clínica exista
    const clinica = await this.clinicaRepository.findById(data.clinica_id);
    if (!clinica) throw new NotFoundError('Clínica');

    // 2. Generamos el UUID y encriptamos la contraseña
    const newId = crypto.randomUUID();
    const contrasenaHash = await bcrypt.hash(data.contrasena, 10);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Buscamos si el usuario ya existe globalmente
      let usuario = await this.usuarioRepository.findByCorreo(data.correo);
      const asignacionId = crypto.randomUUID();

      if (!usuario) {
        // Creamos el usuario
        await this.usuarioRepository.createWithTransaction(
          connection,
          newId,
          data.correo,
          contrasenaHash,
          data.nombre,
          data.primer_apellido, 
          data.segundo_apellido ?? null
        );

        // Asignamos a la clínica
        await this.usuarioRepository.assignClinicaWithTransaction(
          connection,
          asignacionId,
          newId,
          data.clinica_id,
          data.rol
        );
      } else {
        // Ya existe, verificamos que no esté en la misma clínica
        const asignaciones = await this.usuarioRepository.findAsignaciones(usuario.id);
        const yaEstaEnClinica = asignaciones.some(a => a.clinica_id === data.clinica_id);

        if (yaEstaEnClinica) {
          throw new ConflictError('Este correo ya está registrado en esta clínica');
        }

        // Asignamos a la clínica
        await this.usuarioRepository.assignClinicaWithTransaction(
          connection,
          asignacionId,
          usuario.id,
          data.clinica_id,
          data.rol
        );
      }

      await connection.commit();
      
      // Devolver la entidad del usuario (nuevo o existente)
      return await this.getById(usuario ? usuario.id : newId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(id: string, data: UpdateUsuarioDTO, clinicaId: string): Promise<UsuarioEntity> {
    const existingRow = await this.usuarioRepository.findById(id);
    if (!existingRow) throw new NotFoundError('Usuario');

    // Si intenta cambiar el correo, verificamos colisión
    if (data.correo && data.correo !== existingRow.correo) {
      const existeCorreo = await this.usuarioRepository.findByCorreo(data.correo);
      if (existeCorreo) throw new ConflictError('Este correo ya está en uso por otro usuario');
    }

    const newCorreo = data.correo ?? existingRow.correo;
    const newNombre = data.nombre ?? existingRow.nombre;
    const newPrimerApellido = data.primer_apellido ?? existingRow.primer_apellido; 
    const newSegundoApellido = data.segundo_apellido !== undefined ? data.segundo_apellido : existingRow.segundo_apellido; 

    await this.usuarioRepository.update(id, newCorreo, newNombre, newPrimerApellido, newSegundoApellido);

    // Actualizar rol en la clínica si se proveyó
    if (data.rol) {
      await this.usuarioRepository.updateRolClinica(id, clinicaId, data.rol);
    }

    return await this.getById(id);
  }

  async delete(id: string, clinicaId: string): Promise<void> {
    const existing = await this.usuarioRepository.findById(id);
    if (!existing) throw new NotFoundError('Usuario');

    // Desactivamos la asignación de la clínica, no todo el usuario global
    await this.usuarioRepository.softDeleteAsignacion(id, clinicaId);
    
    // Opcional: si ya no tiene ninguna asignación, desactivar al usuario
    const asignaciones = await this.usuarioRepository.findAsignaciones(id);
    if (asignaciones.length === 0) {
      await this.usuarioRepository.softDelete(id);
    }
  }

  async updatePassword(id: string, data: UpdatePasswordDTO): Promise<void> {
    const existingRow = await this.usuarioRepository.findById(id);
    if (!existingRow) throw new NotFoundError('Usuario');

    const isMatch = await bcrypt.compare(data.contrasenaActual, existingRow.contrasena_hash);
    if (!isMatch) throw new UnauthorizedError('La contraseña actual es incorrecta');

    const nuevoHash = await bcrypt.hash(data.nuevaContrasena, 10);
    await this.usuarioRepository.updatePassword(id, nuevoHash);
  }
}
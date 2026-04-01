import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repositore.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repositore.js'; // Para verificar que la clínica exista
import { mapUsuarioRowToEntity, type CreateUsuarioDTO, type UpdateUsuarioDTO, type UsuarioEntity } from '../../domain/usuario/usuario.domain.js';

export class UsuarioService {
  private usuarioRepository = new UsuarioRepository();
  private clinicaRepository = new ClinicaRepository();

  async getAllByClinica(clinicaId: string): Promise<UsuarioEntity[]> {
    const rows = await this.usuarioRepository.findAllByClinica(clinicaId);
    return rows.map(mapUsuarioRowToEntity); // Transformamos a Entidad Pura (oculta el hash)
  }

  async getById(id: string): Promise<UsuarioEntity> {
    const row = await this.usuarioRepository.findById(id);
    if (!row) throw new Error('USUARIO_NOT_FOUND');
    return mapUsuarioRowToEntity(row);
  }

  async create(data: CreateUsuarioDTO): Promise<UsuarioEntity> {
    // 1. Verificamos que la clínica exista
    const clinica = await this.clinicaRepository.findById(data.clinica_id);
    if (!clinica) throw new Error('CLINICA_NOT_FOUND');

    // 2. Verificamos que el correo no esté duplicado en esta clínica
    const existeCorreo = await this.usuarioRepository.findByCorreoYClinica(data.correo, data.clinica_id);
    if (existeCorreo) throw new Error('CORREO_DUPLICADO');

    // 3. Generamos el UUID y encriptamos la contraseña (10 rondas de salt)
    const newId = crypto.randomUUID();
    const contrasenaHash = await bcrypt.hash(data.contrasena, 10);

    // 4. Guardamos en base de datos
    await this.usuarioRepository.create(
      newId,
      data.clinica_id,
      data.correo,
      contrasenaHash,
      data.nombre,
      data.primer_apellido, 
      data.segundo_apellido ?? null,
      data.rol
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateUsuarioDTO): Promise<UsuarioEntity> {
    const existingRow = await this.usuarioRepository.findById(id);
    if (!existingRow) throw new Error('USUARIO_NOT_FOUND');

    // Si intenta cambiar el correo, verificamos que el nuevo no le pertenezca a otro usuario en su misma clínica
    if (data.correo && data.correo !== existingRow.correo) {
      const existeCorreo = await this.usuarioRepository.findByCorreoYClinica(data.correo, existingRow.clinica_id);
      if (existeCorreo) throw new Error('CORREO_DUPLICADO');
    }

    const newCorreo = data.correo ?? existingRow.correo;
    const newNombre = data.nombre ?? existingRow.nombre;
    const newPrimerApellido = data.primer_apellido ?? existingRow.primer_apellido; 
    const newSegundoApellido = data.segundo_apellido !== undefined ? data.segundo_apellido : existingRow.segundo_apellido; 
    const newRol = data.rol ?? existingRow.rol;

    await this.usuarioRepository.update(id, newCorreo, newNombre, newPrimerApellido, newSegundoApellido, newRol);

    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.usuarioRepository.findById(id);
    if (!existing) throw new Error('USUARIO_NOT_FOUND');

    await this.usuarioRepository.softDelete(id);
  }
}
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repository.js';
import { UnauthorizedError, ForbiddenError } from '../../common/errors/domain.errors.js';
import { mapUsuarioRowToEntity, type UsuarioEntity, type UsuarioClinicaRow } from '../../domain/usuario/usuario.domain.js';
import type { LoginDTO } from '../../domain/auth/auth.domain.js';

export type LoginResult = 
  | { success: true; requiresSelection: true; availableClinics: { id: string; nombre: string; rol: string }[] }
  | { success: true; token: string; usuario: UsuarioEntity };

export class AuthService {
  private usuarioRepository = new UsuarioRepository();

  async login(data: LoginDTO): Promise<LoginResult> {
    // 1. Obtenemos el usuario por correo
    const usuario = await this.usuarioRepository.findByCorreo(data.correo);

    // 2. Verificamos si existe
    if (!usuario) {
        throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    // 3. Validamos la contraseña
    const contrasenaValida = await bcrypt.compare(data.contrasena, usuario.contrasena_hash);
    if (!contrasenaValida) {
        throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    // 4. Consultamos las asignaciones de clínica del usuario
    const asignaciones = await this.usuarioRepository.findAsignaciones(usuario.id);
    
    if (asignaciones.length === 0) {
        throw new ForbiddenError('El acceso está suspendido. No tienes clínicas activas asignadas.');
    }

    let clinicaSeleccionada: UsuarioClinicaRow | undefined;

    // 5. Lógica Multitenant
    if (data.clinica_id) {
        // Validar que el usuario pertenezca a la clínica seleccionada
        clinicaSeleccionada = asignaciones.find(a => a.clinica_id === data.clinica_id);
        if (!clinicaSeleccionada) {
            throw new ForbiddenError('No tienes acceso a la clínica seleccionada.');
        }
    } else {
        // No envió clinica_id
        if (asignaciones.length === 1) {
            // Si solo tiene 1, seleccionamos esa automáticamente
            clinicaSeleccionada = asignaciones[0];
        } else {
            // Si tiene varias, requerimos selección
            return {
                success: true,
                requiresSelection: true,
                availableClinics: asignaciones.map(a => ({
                    id: a.clinica_id,
                    nombre: a.clinica_nombre || 'Clínica Desconocida',
                    rol: a.rol
                }))
            };
        }
    }

    // 6. Generar el Token con el contexto de la clínica resuelta
    // clinicaSeleccionada is guaranteed to be defined here (early return above if multiple clinics)
    const clinicaResuelta = clinicaSeleccionada!;
    const payload = {
        id: usuario.id,
        clinicaId: clinicaResuelta.clinica_id,
        rol: clinicaResuelta.rol
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    return {
        success: true,
        token,
        usuario: mapUsuarioRowToEntity(usuario, asignaciones)
    };
  }
}
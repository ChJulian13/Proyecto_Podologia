import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repositore.js';
import { mapUsuarioRowToEntity, type UsuarioEntity } from '../../domain/usuario/usuario.domain.js';
import type { LoginDTO } from '../../domain/auth/auth.domain.js';

export class AuthService {
  private usuarioRepository = new UsuarioRepository();

  async login(data: LoginDTO): Promise<{ token: string; usuario: UsuarioEntity }> {
    // 1. Obtenemos el arreglo de usuarios
    const usuarios = await this.usuarioRepository.findByCorreo(data.correo);

    // 2. Usamos desestructuración para tomar el primer elemento.
    // Aquí 'usuario' es de tipo 'UsuarioRow | undefined'
    const [usuario] = usuarios;

    // 3. Verificamos si existe. Si no existe, lanzamos el error.
    // A partir de aquí, TypeScript sabe que 'usuario' es 100% una 'UsuarioRow'
    if (!usuario) {
        throw new Error('CREDENCIALES_INVALIDAS');
    }

    // 4. Ahora 'usuario.contrasena_hash' será reconocido sin problemas
    const contrasenaValida = await bcrypt.compare(data.contrasena, usuario.contrasena_hash);
    
    if (!contrasenaValida) {
        throw new Error('CREDENCIALES_INVALIDAS');
    }

    // 5. Generar el Token
    const payload = {
        id: usuario.id,
        clinicaId: usuario.clinica_id,
        rol: usuario.rol
    };

    const secret = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    const token = jwt.sign(payload, secret, { expiresIn: '8h' });

    return {
        token,
        usuario: mapUsuarioRowToEntity(usuario)
    };
    }
}
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../../repositories/usuario/usuario.repository.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repository.js'; // <-- NUEVO IMPORT
import { mapUsuarioRowToEntity, type UsuarioEntity } from '../../domain/usuario/usuario.domain.js';
import type { LoginDTO } from '../../domain/auth/auth.domain.js';

export class AuthService {
  private usuarioRepository = new UsuarioRepository();
  private clinicaRepository = new ClinicaRepository(); // <-- NUEVA INSTANCIA

  async login(data: LoginDTO): Promise<{ token: string; usuario: UsuarioEntity }> {
    // 1. Obtenemos el arreglo de usuarios
    const usuarios = await this.usuarioRepository.findByCorreo(data.correo);

    // 2. Usamos desestructuración para tomar el primer elemento.
    const [usuario] = usuarios;

    // 3. Verificamos si existe.
    if (!usuario) {
        throw new Error('CREDENCIALES_INVALIDAS');
    }

    // 4. Validamos la contraseña primero (por seguridad, para evitar fuerza bruta de estados)
    const contrasenaValida = await bcrypt.compare(data.contrasena, usuario.contrasena_hash);
    
    if (!contrasenaValida) {
        throw new Error('CREDENCIALES_INVALIDAS');
    }

    // --- NUEVA VALIDACIÓN SAAS ---
    // 5. Consultamos la clínica del usuario
    const clinica = await this.clinicaRepository.findById(usuario.clinica_id);
    
    // Si la clínica no existe o su estado es 0 (false), bloqueamos el login
    if (!clinica || clinica.esta_activa === 0) {
        throw new Error('CLINICA_INACTIVA');
    }
    // -----------------------------

    // 6. Generar el Token
    const payload = {
        id: usuario.id,
        clinicaId: usuario.clinica_id,
        rol: usuario.rol
    };

    const secret = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    const tiempoExpiracion = parseInt(process.env.JWT_EXPIRES_IN || '43200', 10);
    const token = jwt.sign(payload, secret, { expiresIn: tiempoExpiracion });

    return {
        token,
        usuario: mapUsuarioRowToEntity(usuario)
    };
  }
}
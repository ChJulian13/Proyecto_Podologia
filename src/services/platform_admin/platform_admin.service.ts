import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PlatformAdminRepository } from '../../repositories/platform_admin/platform_admin.repository.js';
import { type LoginSuperAdminDTO } from '../../domain/platform_admin/platform_admin.domain.js';

export class PlatformAdminService {
  private repository = new PlatformAdminRepository();

  async login(data: LoginSuperAdminDTO): Promise<string> {
    const admin = await this.repository.findByCorreo(data.correo);
    if (!admin) throw new Error('CREDENCIALES_INVALIDAS');

    const isValidPassword = await bcrypt.compare(data.contrasena, admin.contrasena_hash);
    if (!isValidPassword) throw new Error('CREDENCIALES_INVALIDAS');

    const secret = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    
    const payload = {
      id: admin.id,
      rol: 'SUPER_ADMIN' 
    };

    return jwt.sign(payload, secret, { expiresIn: '12h' });
  }
}
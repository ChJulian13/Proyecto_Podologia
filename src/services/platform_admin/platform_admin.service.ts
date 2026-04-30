import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { PlatformAdminRepository } from '../../repositories/platform_admin/platform_admin.repository.js';
import { UnauthorizedError } from '../../common/errors/domain.errors.js';
import { type LoginSuperAdminDTO } from '../../domain/platform_admin/platform_admin.domain.js';

export class PlatformAdminService {
  private repository = new PlatformAdminRepository();

  async login(data: LoginSuperAdminDTO): Promise<string> {
    const admin = await this.repository.findByCorreo(data.correo);
    if (!admin) throw new UnauthorizedError('Correo o contraseña incorrectos');

    const isValidPassword = await bcrypt.compare(data.contrasena, admin.contrasena_hash);
    if (!isValidPassword) throw new UnauthorizedError('Correo o contraseña incorrectos');

    const payload = {
      id: admin.id,
      rol: 'SUPER_ADMIN'
    };

    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '12h' });
  }
}
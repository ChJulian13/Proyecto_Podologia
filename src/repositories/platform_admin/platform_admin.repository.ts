import { pool } from '../../config/database.js';
import { type PlatformAdminRow } from '../../domain/platform_admin/platform_admin.domain.js';

export class PlatformAdminRepository {
  async findByCorreo(correo: string): Promise<PlatformAdminRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM platform_admins WHERE correo = ? LIMIT 1',
      [correo]
    );
    return rows[0] ?? null;
  }
}
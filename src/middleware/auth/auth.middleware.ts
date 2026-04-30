import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { RolUsuario } from '../../domain/usuario/usuario.domain.js';

export interface TokenPayload {
  id: string;
  clinicaId?: string;
  rol: RolUsuario | 'SUPER_ADMIN';
}

export interface AuthRequest extends Request {
  usuario?: TokenPayload; 
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Extraemos el token directamente de la bóveda de cookies del navegador
  const token = req.cookies?.access_token;

  if (!token) {
    res.status(401).json({ success: false, message: 'Acceso denegado. No hay sesión activa.' });
    return;
  }

  try {
    const secret = env.JWT_SECRET;
    
    const payloadDecodificado = jwt.verify(token, secret) as TokenPayload;

    req.usuario = payloadDecodificado;

    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Token inválido o expirado. Inicia sesión nuevamente.' });
  }
};
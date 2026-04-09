import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { RolUsuario } from '../../domain/usuario/usuario.domain.js';

export interface TokenPayload {
  id: string;
  clinicaId: string;
  rol: RolUsuario;
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
    const secret = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    
    const payloadDecodificado = jwt.verify(token, secret) as TokenPayload;

    req.usuario = payloadDecodificado;

    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Token inválido o expirado. Inicia sesión nuevamente.' });
  }
};
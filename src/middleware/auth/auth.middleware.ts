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
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Acceso denegado. Cabecera ausente o inválida.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Estructura del token mal formada.' });
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
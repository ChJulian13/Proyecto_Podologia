/**
 * Construye un nombre completo a partir de partes (nombre, apellidos).
 * Filtra valores null/undefined y une con espacio.
 */
export const buildNombreCompleto = (...parts: (string | null | undefined)[]): string => {
  return parts.filter(Boolean).join(' ') || 'Desconocido';
};

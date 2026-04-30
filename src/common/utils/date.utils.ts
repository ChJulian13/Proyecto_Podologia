/**
 * Normaliza un valor de fecha (Date | string) a formato 'YYYY-MM-DD'.
 * Devuelve cadena vacía si el valor es null/undefined.
 */
export const toDateString = (value: string | Date | null | undefined): string => {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().substring(0, 10);
  return String(value).substring(0, 10);
};

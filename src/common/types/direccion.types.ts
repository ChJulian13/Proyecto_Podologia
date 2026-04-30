/**
 * Campos de dirección compartidos entre Paciente y Clínica (entidad de dominio).
 */
export interface DireccionFields {
  codigoPostal: string | null;
  estado: string | null;
  municipio: string | null;
  ciudad: string | null;
  colonia: string | null;
  calleYNumero: string | null;
}

/**
 * Columnas de dirección tal como llegan de MySQL (snake_case).
 */
export interface DireccionRow {
  codigo_postal: string | null;
  estado: string | null;
  municipio: string | null;
  ciudad: string | null;
  colonia: string | null;
  calle_y_numero: string | null;
}

/**
 * Mapper reutilizable: snake_case Row → camelCase Fields.
 */
export const mapDireccionRowToFields = (row: DireccionRow): DireccionFields => ({
  codigoPostal: row.codigo_postal,
  estado: row.estado,
  municipio: row.municipio,
  ciudad: row.ciudad,
  colonia: row.colonia,
  calleYNumero: row.calle_y_numero,
});

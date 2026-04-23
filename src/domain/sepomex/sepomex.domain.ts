export interface SepomexRawResponse {
  d_codigo: string;
  d_estado: string;
  d_ciudad: string;
  d_asenta: string;
  D_mnpio: string;
  d_tipo_asenta: string;
}

// Nuestra entidad limpia y transformada para el Frontend
export interface DireccionInfoEntity {
  codigoPostal: string;
  estado: string;
  municipio: string;
  ciudad: string;
  colonias: string[]; 
}
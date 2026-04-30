import { env } from '../../config/env.js';
import { NotFoundError, BadRequestError } from '../../common/errors/domain.errors.js';
import type { SepomexRawResponse, DireccionInfoEntity } from './sepomex.domain.js';

export class SepomexService {
  
  async getInfoByCP(cp: string): Promise<DireccionInfoEntity> {
    const urlConsulta = `${env.MEXICO_API_URL}/api/codigo-postal/${cp}`;
    
    const response = await fetch(urlConsulta);

    if (!response.ok) {
      throw new BadRequestError('Error al conectar con el servicio de códigos postales');
    }

    // 1. Obtenemos el objeto completo (que incluye { meta, data })
    const responseData: any = await response.json();
    
    // 2. Extraemos el arreglo real que viene dentro de la propiedad 'data'
    const registros = responseData.data;

    // 3. Validación de seguridad: Asegurarnos de que 'registros' sea realmente un arreglo
    if (!registros || !Array.isArray(registros) || registros.length === 0) {
      throw new NotFoundError('Código postal');
    }

    // 4. Si llegamos aquí, TypeScript y Node saben que 'registros' es un arreglo con datos.
    // Tomamos el primer elemento para sacar el estado, municipio, etc.
    const baseInfo = registros[0] as SepomexRawResponse;

    // Mapeamos todo el arreglo para sacar únicamente los nombres de las colonias
    const listadoColonias = registros.map((item: SepomexRawResponse) => item.d_asenta);

    return {
      codigoPostal: baseInfo.d_codigo,
      estado: baseInfo.d_estado,
      municipio: baseInfo.D_mnpio,
      ciudad: baseInfo.d_ciudad, 
      colonias: listadoColonias
    };
  }
}
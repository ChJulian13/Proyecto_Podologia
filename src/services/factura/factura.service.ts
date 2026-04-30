import crypto from 'crypto';
import { FacturaRepository } from '../../repositories/factura/factura.repository.js';
import { PacienteRepository } from '../../repositories/paciente/paciente.repository.js';
import { CitaRepository } from '../../repositories/cita/cita.repository.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors/domain.errors.js';
import { mapFacturaRowToEntity, type CreateFacturaDTO, type UpdateEstadoFacturaDTO, type FacturaEntity } from '../../domain/factura/factura.domain.js';

export class FacturaService {
  private facturaRepository = new FacturaRepository();
  private pacienteRepository = new PacienteRepository();
  private citaRepository = new CitaRepository();

  async getByCita(citaId: string): Promise<FacturaEntity[]> {
    const rows = await this.facturaRepository.findByCitaId(citaId);
    return rows.map(mapFacturaRowToEntity);
  }

  async create(data: CreateFacturaDTO): Promise<FacturaEntity> {
    // 1. Validar integridad de Clínica y Paciente
    const paciente = await this.pacienteRepository.findById(data.paciente_id);
    if (!paciente || paciente.clinica_id !== data.clinica_id) {
      throw new BadRequestError('El paciente no existe o no pertenece a esta clínica');
    }

    // 2. Si hay cita, validar que exista y pertenezca al paciente
    if (data.cita_id) {
      const cita = await this.citaRepository.findById(data.cita_id);
      if (!cita || cita.paciente_id !== data.paciente_id) {
        throw new BadRequestError('La cita no coincide con el paciente');
      }
    }

    // 3. Evitar duplicados de número de factura en la misma clínica
    const facturaExistente = await this.facturaRepository.findByNumeroFactura(data.clinica_id, data.numero_factura);
    if (facturaExistente) {
      throw new ConflictError('Este número de factura ya existe en la clínica');
    }

    const newId = crypto.randomUUID();
    await this.facturaRepository.create(
      newId, data.clinica_id, data.paciente_id, data.cita_id ?? null,
      data.numero_factura, data.descripcion_servicio, data.monto
    );

    const nuevaFactura = await this.facturaRepository.findById(newId);
    return mapFacturaRowToEntity(nuevaFactura!);
  }

  async marcarComoPagada(id: string, data: UpdateEstadoFacturaDTO): Promise<FacturaEntity> {
    const factura = await this.facturaRepository.findById(id);
    if (!factura) throw new NotFoundError('Factura');
    
    if (factura.estado_pago === 'PAGADO') {
      throw new BadRequestError('Esta factura ya fue pagada anteriormente');
    }

    await this.facturaRepository.marcarComoPagada(id, data.metodo_pago);
    
    const facturaActualizada = await this.facturaRepository.findById(id);
    return mapFacturaRowToEntity(facturaActualizada!);
  }
}
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { ImagenPacienteRepository } from '../../repositories/imagen_paciente/imagen_paciente.repository.js';
import { PacienteRepository } from '../../repositories/paciente/paciente.repository.js';
import { NotaClinicaRepository } from '../../repositories/nota_clinica/nota_clinica.repository.js';
import { NotFoundError, BadRequestError } from '../../common/errors/domain.errors.js';
import { mapImagenRowToEntity, type CreateImagenDTO, type ImagenPacienteEntity } from '../../domain/imagen_paciente/imagen_paciente.domain.js';

export class ImagenPacienteService {
  private imagenRepository = new ImagenPacienteRepository();
  private pacienteRepository = new PacienteRepository();
  private notaRepository = new NotaClinicaRepository();

  async getByPaciente(pacienteId: string): Promise<ImagenPacienteEntity[]> {
    const rows = await this.imagenRepository.findByPacienteId(pacienteId);
    return rows.map(mapImagenRowToEntity);
  }

  async getById(id: string): Promise<ImagenPacienteEntity> {
    const row = await this.imagenRepository.findById(id);
    if (!row) throw new NotFoundError('Imagen');
    return mapImagenRowToEntity(row);
  }

  // Recibimos el DTO (textos) y el File (archivo físico procesado por Multer)
  async create(data: CreateImagenDTO, file: Express.Multer.File): Promise<ImagenPacienteEntity> {
    // 1. Validar Paciente
    const paciente = await this.pacienteRepository.findById(data.paciente_id);
    if (!paciente || paciente.clinica_id !== data.clinica_id) {
      throw new BadRequestError('El paciente no existe o no pertenece a esta clínica');
    }

    // 2. Validar Nota Clínica (si se envió)
    if (data.nota_clinica_id) {
      const nota = await this.notaRepository.findById(data.nota_clinica_id);
      if (!nota || nota.paciente_id !== data.paciente_id) {
        throw new BadRequestError('La nota clínica no coincide con este paciente');
      }
    }

    // 3. Generar la URL relativa para guardar en la BD
    // En el backend la guardamos como /uploads/imagenes/nombre_archivo.jpg
    const urlArchivo = `/uploads/imagenes/${file.filename}`;
    const newId = crypto.randomUUID();

    await this.imagenRepository.create(
      newId,
      data.clinica_id,
      data.paciente_id,
      data.nota_clinica_id ?? null,
      urlArchivo,
      data.descripcion ?? null
    );

    return await this.getById(newId);
  }

  async delete(id: string): Promise<void> {
    const imagen = await this.imagenRepository.findById(id);
    if (!imagen) throw new NotFoundError('Imagen');

    // 1. Borrar el registro de la base de datos
    await this.imagenRepository.delete(id);

    // 2. Borrar el archivo físico del disco duro para liberar espacio
    // La urlArchivo viene como "/uploads/imagenes/archivo.jpg", 
    // tenemos que construir la ruta absoluta hacia el disco duro:
    const filePath = path.join(process.cwd(), imagen.url_archivo);
    
    // Verificamos que el archivo exista antes de intentar borrarlo para evitar bloqueos
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async getByNotaClinica(notaClinicaId: string): Promise<ImagenPacienteEntity[]> {
    const rows = await this.imagenRepository.findByNotaClinicaId(notaClinicaId);
    return rows.map(mapImagenRowToEntity);
  }
}
import { DashboardRepository } from '../../repositories/dashboard/dashboard.repositories.js';
import { 
  mapResumenToEntity, mapCitaProximaRowToEntity, mapAlertaNotaToEntity,
  mapIngresoToEntity, mapServicioPopularToEntity, mapTasaAsistenciaToEntity,
  type ResumenHoyEntity, type CitaProximaEntity, type AlertaNotaEntity, type IngresoEntity, type ServicioPopularEntity, type TasaAsistenciaEntity
} from '../../domain/dashboard/dashboard.damain.js';

export class DashboardService {
  private dashboardRepository = new DashboardRepository();

  async getResumenHoy(clinicaId: string, usuarioId: string, rol: string): Promise<ResumenHoyEntity> {
    const row = await this.dashboardRepository.getResumenHoy(clinicaId, usuarioId, rol);
    return mapResumenToEntity(row);
  }

  async getProximasCitas(clinicaId: string, usuarioId: string, rol: string): Promise<CitaProximaEntity[]> {
    const rows = await this.dashboardRepository.getCitasProximas(clinicaId, usuarioId, rol);
    return rows.map(mapCitaProximaRowToEntity);
  }

  async getAlertasNotas(clinicaId: string, usuarioId: string, rol: string): Promise<AlertaNotaEntity[]> {
    const rows = await this.dashboardRepository.getAlertasNotas(clinicaId, usuarioId, rol);
    return rows.map(mapAlertaNotaToEntity);
  }

  async getIngresos(clinicaId: string, fechaInicio: string, fechaFin: string): Promise<IngresoEntity[]> {
    const rows = await this.dashboardRepository.getIngresos(clinicaId, fechaInicio, fechaFin);
    return rows.map(mapIngresoToEntity);
  }

  async getServiciosPopulares(clinicaId: string, fechaInicio: string, fechaFin: string): Promise<ServicioPopularEntity[]> {
    const rows = await this.dashboardRepository.getServiciosPopulares(clinicaId, fechaInicio, fechaFin);
    return rows.map(mapServicioPopularToEntity);
  }

  async getTasaAsistencia(clinicaId: string, fechaInicio: string, fechaFin: string): Promise<TasaAsistenciaEntity[]> {
    const rows = await this.dashboardRepository.getTasaAsistencia(clinicaId, fechaInicio, fechaFin);
    return rows.map(mapTasaAsistenciaToEntity);
  }
}
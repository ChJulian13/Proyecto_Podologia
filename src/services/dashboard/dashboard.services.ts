import { DashboardRepository } from '../../repositories/dashboard/dashboard.repositories.js';
import { 
  mapResumenToEntity, mapCitaProximaRowToEntity, mapAlertaNotaToEntity,
  type ResumenHoyEntity, type CitaProximaEntity, type AlertaNotaEntity 
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
}
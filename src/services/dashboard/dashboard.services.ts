import { DashboardRepository } from '../../repositories/dashboard/dashboard.repositories.js';
import { 
  mapCitaHoyRowToEntity, 
  mapCitaProximaRowToEntity, 
  type CitaHoyEntity, 
  type CitaProximaEntity 
} from '../../domain/dashboard/dashboard.damain.js';

export class DashboardService {
  private dashboardRepository = new DashboardRepository();

  async getCitasDelDia(): Promise<CitaHoyEntity[]> {
    const rows = await this.dashboardRepository.getCitasHoy();
    return rows.map(mapCitaHoyRowToEntity);
  }

  async getProximasCitas(): Promise<CitaProximaEntity[]> {
    const rows = await this.dashboardRepository.getCitasProximas();
    return rows.map(mapCitaProximaRowToEntity);
  }
}
import { Router } from 'express';
import { AgendaRapidaController } from '../../controllers/agenda_rapida/agenda rapida.controller.js';

const router = Router();
const agendaRapidaController = new AgendaRapidaController();

router.post('/', agendaRapidaController.ejecutar);

export default router;
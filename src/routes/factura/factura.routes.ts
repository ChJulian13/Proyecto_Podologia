import { Router } from 'express';
import { FacturaController } from '../../controllers/factura/factura.controller.js';

const router = Router();
const facturaController = new FacturaController();

router.get('/cita/:citaId',  facturaController.getByCita);
router.post('/',  facturaController.create);
router.patch('/:id/pagar',  facturaController.marcarPagada);

export default router;
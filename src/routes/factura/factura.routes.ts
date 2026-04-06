import { Router } from 'express';
import { FacturaController } from '../../controllers/factura/factura.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const facturaController = new FacturaController();

router.get('/cita/:citaId', verificarToken, facturaController.getByCita);
router.post('/', verificarToken, facturaController.create);
router.patch('/:id/pagar', verificarToken, facturaController.marcarPagada);

export default router;
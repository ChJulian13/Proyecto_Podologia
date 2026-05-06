import { Router } from 'express';
import { VentaInventarioController } from '../../controllers/venta_inventario/venta_inventario.controller.js';

const router = Router();
const ventaController = new VentaInventarioController();

router.get('/factura/:facturaId', ventaController.getByFactura);
router.get('/clinica/:clinicaId', ventaController.getByClinica);
router.post('/',                  ventaController.create);
router.patch('/:id/cancelar',     ventaController.cancelar);

export default router;

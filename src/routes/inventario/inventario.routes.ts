import { Router } from 'express';
import { InventarioController } from '../../controllers/inventario/inventario.controller.js';

const router = Router();
const inventarioController = new InventarioController();

router.get('/clinica/:clinicaId',                inventarioController.getAllByClinica);
router.get('/clinica/:clinicaId/productos-venta', inventarioController.getProductosVentaByClinica);
router.get('/:id',                               inventarioController.getById);
router.post('/',                                 inventarioController.create);
router.patch('/:id',                             inventarioController.update);
router.delete('/:id',                            inventarioController.delete);

// Sub-recursos: Lotes
router.get('/:id/lotes',                         inventarioController.getLotes);
router.post('/:id/lotes',                        inventarioController.createLote);

// Sub-recursos: Códigos de barras
router.get('/:id/codigos-barras',                inventarioController.getCodigosBarras);
router.post('/:id/codigos-barras',               inventarioController.createCodigoBarras);
router.delete('/:id/codigos-barras/:codigoId',   inventarioController.deleteCodigoBarras);

export default router;

import { Router } from 'express';
import { InventarioController } from '../../controllers/inventario/inventario.controller.js';

const router = Router();
const inventarioController = new InventarioController();

router.get('/clinica/:clinicaId', inventarioController.getAllByClinica);
router.get('/:id',                inventarioController.getById);
router.post('/',                  inventarioController.create);
router.patch('/:id',              inventarioController.update);
router.patch('/:id/stock',        inventarioController.ajustarStock);
router.delete('/:id',             inventarioController.delete);

export default router;

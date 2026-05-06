import { Router } from 'express';
import { CategoriaInventarioController } from '../../controllers/categoria_inventario/categoria_inventario.controller.js';

const router = Router();
const categoriaController = new CategoriaInventarioController();

router.get('/',      categoriaController.getAll);
router.get('/:id',   categoriaController.getById);
router.post('/',     categoriaController.create);
router.patch('/:id', categoriaController.update);
router.delete('/:id', categoriaController.delete);

export default router;

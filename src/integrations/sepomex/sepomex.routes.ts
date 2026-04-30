import { Router } from 'express';
import { SepomexController } from './sepomex.controller.js';

const router = Router();
const sepomexController = new SepomexController();

router.get('/cp/:cp', sepomexController.getByCP);

export default router;
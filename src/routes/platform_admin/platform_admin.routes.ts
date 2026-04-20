import { Router } from 'express';
import { PlatformAdminController } from '../../controllers/platform_admin/platform_admin.controller.js';

const router = Router();
const controller = new PlatformAdminController();

router.post('/login', controller.login);
router.post('/logout', controller.logout);

export default router;
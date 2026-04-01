import { Router } from 'express';
import { AuthController } from '../../controllers/auth/auth.controller.js';

const router = Router();
const authController = new AuthController();

// Ruta de login
router.post('/login', authController.login);

export default router;
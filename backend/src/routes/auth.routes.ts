import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authValidators } from '../utils/validators/auth.validators';

const router = Router();

// Public routes
router.post('/manager/register', validate(authValidators.managerRegister), authController.registerManager);
router.post('/employee/register', validate(authValidators.employeeRegister), authController.registerEmployee);
router.post('/manager/login', validate(authValidators.login), authController.loginManager);
router.post('/employee/login', validate(authValidators.login), authController.loginEmployee);

// Protected routes (Manager only)
router.patch('/employee/status', 
  authMiddleware.requireAuth, 
  authMiddleware.requireManager,
  validate(authValidators.updateEmployeeStatus),
  authController.updateEmployeeStatus
);

router.get('/employees/pending',
  authMiddleware.requireAuth,
  authMiddleware.requireManager,
  authController.getPendingEmployees
);

export default router;
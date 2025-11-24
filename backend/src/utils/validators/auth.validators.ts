import { body } from 'express-validator';

export const authValidators = {
  managerRegister: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('companyName').notEmpty().withMessage('Company name is required')
  ],

  employeeRegister: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('department').notEmpty().withMessage('Department is required'),
    body('position').notEmpty().withMessage('Position is required'),
    body('managerId').notEmpty().withMessage('Manager ID is required')
  ],

  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],

  updateEmployeeStatus: [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('status').isIn(['approved', 'rejected', 'suspended']).withMessage('Invalid status')
  ]
};
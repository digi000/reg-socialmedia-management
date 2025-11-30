import { z } from 'zod';

export const authValidators = {
  managerRegister: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    companyName: z.string().min(1, 'Company name is required')
  }),

  employeeRegister: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
    managerId: z.string().uuid('Valid manager ID is required')
  }),

  login: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required')
  }),

  updateEmployeeStatus: z.object({
    employeeId: z.string().uuid('Valid employee ID is required'),
    status: z.enum(['approved', 'rejected', 'suspended'], { 
      errorMap: () => ({ message: 'Invalid status' }) 
    })
  })
};
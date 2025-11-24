import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

const authService = new AuthService();

export const authController = {
  // Manager Registration
  registerManager: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, companyName } = req.body;

    const manager = await authService.registerManager({
      name,
      email,
      password,
      companyName
    });

    // Don't send password back
    const { password: _, ...managerWithoutPassword } = manager;
    
    return new ApiResponse(
      managerWithoutPassword,
      'Manager registered successfully'
    ).send(res);
  }),

  // Employee Registration
  registerEmployee: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, department, position, managerId, socialUsername } = req.body;

    const employee = await authService.registerEmployee({
      name,
      email,
      password,
      department,
      position,
      managerId,
      socialUsername
    });

    // Don't send password back
    const { password: _, ...employeeWithoutPassword } = employee;
    
    return new ApiResponse(
      employeeWithoutPassword,
      'Employee registered successfully. Waiting for manager approval.'
    ).send(res);
  }),

  // Manager Login
  loginManager: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { manager, token } = await authService.loginManager(email, password);

    const { password: _, ...managerWithoutPassword } = manager;
    
    return new ApiResponse(
      {
        user: managerWithoutPassword,
        token,
        role: 'manager'
      },
      'Manager login successful'
    ).send(res);
  }),

  // Employee Login
  loginEmployee: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { employee, token } = await authService.loginEmployee(email, password);

    const { password: _, ...employeeWithoutPassword } = employee;
    
    return new ApiResponse(
      {
        user: employeeWithoutPassword,
        token,
        role: 'employee'
      },
      'Employee login successful'
    ).send(res);
  }),

  // Approve/Reject Employee (Manager only)
  updateEmployeeStatus: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, status } = req.body;
    const managerId = (req as any).user?.userId; // From auth middleware

    if (!managerId) {
      return new ApiResponse(null, 'Unauthorized', 401).send(res);
    }

    const employee = await authService.updateEmployeeStatus({
      employeeId,
      status,
      managerId
    });

    const { password: _, ...employeeWithoutPassword } = employee;
    
    return new ApiResponse(
      employeeWithoutPassword,
      `Employee ${status} successfully`
    ).send(res);
  }),

  // Get Pending Employees (Manager only)
  getPendingEmployees: asyncHandler(async (req: Request, res: Response) => {
    const managerId = (req as any).user?.userId;

    if (!managerId) {
      return new ApiResponse(null, 'Unauthorized', 401).send(res);
    }

    const pendingEmployees = await authService.getPendingEmployees(managerId);
    
    // Remove passwords from response
    const employeesWithoutPasswords = pendingEmployees.map(emp => {
      const { password, ...rest } = emp;
      return rest;
    });

    return new ApiResponse(
      employeesWithoutPasswords,
      'Pending employees retrieved successfully'
    ).send(res);
  })
};
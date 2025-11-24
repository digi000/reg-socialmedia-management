import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Manager, CreateManagerInput } from '../models/Manager';
import { Employee, CreateEmployeeInput } from '../models/Employee';

export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Manager Registration
  async registerManager(input: CreateManagerInput): Promise<Manager> {
    // Check if manager already exists
    const existingManager = await this.findManagerByEmail(input.email);
    if (existingManager) {
      throw new Error('Manager with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    // Create manager (in real app, this would be DB insert)
    const manager: Manager = {
      id: this.generateId(),
      ...input,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date()
    };

    // Save to database would go here
    // await db.managers.insert(manager);
    
    return manager;
  }

  // Employee Registration (requires manager approval)
  async registerEmployee(input: CreateEmployeeInput): Promise<Employee> {
    // Check if employee already exists
    const existingEmployee = await this.findEmployeeByEmail(input.email);
    if (existingEmployee) {
      throw new Error('Employee with this email already exists');
    }

    // Verify manager exists
    const manager = await this.findManagerById(input.managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    // Create employee with pending status
    const employee: Employee = {
      id: this.generateId(),
      ...input,
      password: hashedPassword,
      status: 'pending',
      isActive: true,
      createdAt: new Date()
    };

    // Save to database would go here
    // await db.employees.insert(employee);
    
    return employee;
  }

  // Manager Login
  async loginManager(email: string, password: string): Promise<{ manager: Manager; token: string }> {
    const manager = await this.findManagerByEmail(email);
    if (!manager || !manager.isActive) {
      throw new Error('Invalid credentials or account inactive');
    }

    const isValidPassword = await bcrypt.compare(password, manager.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(manager.id, 'manager');
    return { manager, token };
  }

  // Employee Login (only if approved)
  async loginEmployee(email: string, password: string): Promise<{ employee: Employee; token: string }> {
    const employee = await this.findEmployeeByEmail(email);
    if (!employee || !employee.isActive) {
      throw new Error('Invalid credentials or account inactive');
    }

    if (employee.status !== 'approved') {
      throw new Error('Account pending approval. Please contact your manager.');
    }

    const isValidPassword = await bcrypt.compare(password, employee.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(employee.id, 'employee');
    return { employee, token };
  }

  // Manager approves/rejects employee
  async updateEmployeeStatus(input: UpdateEmployeeStatusInput): Promise<Employee> {
    const employee = await this.findEmployeeById(input.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Verify the manager owns this employee
    if (employee.managerId !== input.managerId) {
      throw new Error('Unauthorized to update this employee');
    }

    employee.status = input.status;
    if (input.status === 'approved') {
      employee.approvedAt = new Date();
      employee.approvedBy = input.managerId;
    }

    // Update in database would go here
    // await db.employees.update(employee.id, employee);
    
    return employee;
  }

  // Get pending employees for manager
  async getPendingEmployees(managerId: string): Promise<Employee[]> {
    // This would query the database
    // return await db.employees.find({ managerId, status: 'pending' });
    return []; // Placeholder
  }

  private generateToken(userId: string, role: 'manager' | 'employee'): string {
    return jwt.sign(
      { userId, role, timestamp: Date.now() },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // These would be database calls in real implementation
  private async findManagerByEmail(email: string): Promise<Manager | null> {
    // return await db.managers.findByEmail(email);
    return null;
  }

  private async findManagerById(id: string): Promise<Manager | null> {
    // return await db.managers.findById(id);
    return null;
  }

  private async findEmployeeByEmail(email: string): Promise<Employee | null> {
    // return await db.employees.findByEmail(email);
    return null;
  }

  private async findEmployeeById(id: string): Promise<Employee | null> {
    // return await db.employees.findById(id);
    return null;
  }
}
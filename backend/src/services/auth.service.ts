import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { Manager, CreateManagerInput } from '../models/Manager';
import { Employee, CreateEmployeeInput, UpdateEmployeeStatusInput } from '../models/Employee';

export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Manager Registration
  async registerManager(input: CreateManagerInput): Promise<Manager & { password: string }> {
    // Check if manager already exists
    const existingManager = await this.findManagerByEmail(input.email);
    if (existingManager) {
      throw new Error('Manager with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    // Create manager in database
    const result = await db.query(
      `INSERT INTO managers (name, email, password, company_name, is_active, created_at)
       VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
       RETURNING id, name, email, password, company_name as "companyName", is_active as "isActive", created_at as "createdAt"`,
      [input.name, input.email, hashedPassword, input.companyName]
    );

    return result.rows[0];
  }

  // Employee Registration (requires manager approval)
  async registerEmployee(input: CreateEmployeeInput): Promise<Employee & { password: string }> {
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
    const result = await db.query(
      `INSERT INTO employees (name, email, password, department, position, manager_id, social_username, status, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', true, CURRENT_TIMESTAMP)
       RETURNING id, name, email, password, department, position, manager_id as "managerId", 
                 social_username as "socialUsername", status, is_active as "isActive", created_at as "createdAt"`,
      [input.name, input.email, hashedPassword, input.department, input.position, input.managerId, input.socialUsername || null]
    );

    return result.rows[0];
  }

  // Manager Login
  async loginManager(email: string, password: string): Promise<{ manager: Manager & { password: string }; token: string }> {
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
  async loginEmployee(email: string, password: string): Promise<{ employee: Employee & { password: string }; token: string }> {
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
  async updateEmployeeStatus(input: UpdateEmployeeStatusInput): Promise<Employee & { password: string }> {
    const employee = await this.findEmployeeById(input.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Verify the manager owns this employee
    if (employee.managerId !== input.managerId) {
      throw new Error('Unauthorized to update this employee');
    }

    let result;
    if (input.status === 'approved') {
      result = await db.query(
        `UPDATE employees 
         SET status = $1, approved_at = CURRENT_TIMESTAMP, approved_by = $2
         WHERE id = $3
         RETURNING id, name, email, password, department, position, manager_id as "managerId",
                   social_username as "socialUsername", status, is_active as "isActive", 
                   approved_at as "approvedAt", approved_by as "approvedBy", created_at as "createdAt"`,
        [input.status, input.managerId, input.employeeId]
      );
    } else {
      result = await db.query(
        `UPDATE employees 
         SET status = $1
         WHERE id = $2
         RETURNING id, name, email, password, department, position, manager_id as "managerId",
                   social_username as "socialUsername", status, is_active as "isActive", 
                   approved_at as "approvedAt", approved_by as "approvedBy", created_at as "createdAt"`,
        [input.status, input.employeeId]
      );
    }

    return result.rows[0];
  }

  // Get pending employees for manager
  async getPendingEmployees(managerId: string): Promise<(Employee & { password: string })[]> {
    const result = await db.query(
      `SELECT id, name, email, password, department, position, manager_id as "managerId",
              social_username as "socialUsername", status, is_active as "isActive", created_at as "createdAt"
       FROM employees
       WHERE manager_id = $1 AND status = 'pending'
       ORDER BY created_at DESC`,
      [managerId]
    );
    return result.rows;
  }

  private generateToken(userId: string, role: 'manager' | 'employee'): string {
    return jwt.sign(
      { userId, role, timestamp: Date.now() },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Database query methods
  private async findManagerByEmail(email: string): Promise<(Manager & { password: string }) | null> {
    const result = await db.query(
      `SELECT id, name, email, password, company_name as "companyName", is_active as "isActive", created_at as "createdAt"
       FROM managers WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  private async findManagerById(id: string): Promise<(Manager & { password: string }) | null> {
    const result = await db.query(
      `SELECT id, name, email, password, company_name as "companyName", is_active as "isActive", created_at as "createdAt"
       FROM managers WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  private async findEmployeeByEmail(email: string): Promise<(Employee & { password: string }) | null> {
    const result = await db.query(
      `SELECT id, name, email, password, department, position, manager_id as "managerId",
              social_username as "socialUsername", status, is_active as "isActive", 
              approved_at as "approvedAt", approved_by as "approvedBy", created_at as "createdAt"
       FROM employees WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  private async findEmployeeById(id: string): Promise<(Employee & { password: string }) | null> {
    const result = await db.query(
      `SELECT id, name, email, password, department, position, manager_id as "managerId",
              social_username as "socialUsername", status, is_active as "isActive", 
              approved_at as "approvedAt", approved_by as "approvedBy", created_at as "createdAt"
       FROM employees WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }
}
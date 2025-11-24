export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  managerId: string;     // References Manager
  isActive: boolean;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvedAt?: Date;
  approvedBy?: string; // Manager ID who approved
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  managerId: string;
  socialUsername?: string;
}

export interface UpdateEmployeeStatusInput {
  employeeId: string;
  status: 'approved' | 'rejected' | 'suspended';
  managerId: string;
}
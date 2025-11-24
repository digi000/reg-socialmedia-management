export interface Manager {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  // One Manager has many Employees
}

export interface CreateManagerInput {
  name: string;
  email: string;
  password: string;
  companyName: string;
}
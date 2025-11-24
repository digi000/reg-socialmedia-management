export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  managerId: string;     // References Manager
  isActive: boolean;
  createdAt: Date;
  // One Employee has many SocialAccounts
}

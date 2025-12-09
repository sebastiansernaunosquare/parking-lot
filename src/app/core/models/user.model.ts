export type UserRole = 'admin' | 'resident';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  unit?: string;
  password?: string;
}

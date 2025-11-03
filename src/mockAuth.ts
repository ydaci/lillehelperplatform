// mockAuth.ts
type User = {
  email: string;
  password: string;
  role: 'Admin' | 'Teacher' | 'Learner';
};

const users: User[] = [
  { email: 'admin@mail.com', password: 'admin123', role: 'Admin' },
  { email: 'teacher@mail.com', password: 'teach123', role: 'Teacher' },
  { email: 'learner@mail.com', password: 'learn123', role: 'Learner' },
];

// Simuler un login
export const login = async (email: string, password: string, role: string) => {
  await new Promise(res => setTimeout(res, 500)); // Simule un délai réseau
  const user = users.find(u => u.email === email && u.password === password && u.role === role);
  if (user) {
    return { success: true, token: 'fake-token-123', role: user.role };
  }
  return { success: false, message: 'Invalid credentials' };
};

// Simuler un signup
export const register = async (email: string, password: string, role: string) => {
  await new Promise(res => setTimeout(res, 500));
  const exists = users.find(u => u.email === email);
  if (exists) return { success: false, message: 'Email already used' };
  users.push({ email, password, role: role as any });
  return { success: true };
};

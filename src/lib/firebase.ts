export const db = {
  isActive: () => false,
  getUsers: async () => null,
  getStudents: async () => null,
  getPayments: async () => null,
  seedTables: async (_users: unknown[], _students: unknown[], _payments: unknown[]) => false,
  saveUser: async (_user: unknown) => {},
  deleteUser: async (_userId: string) => {},
  saveStudent: async (_student: unknown) => {},
  deleteStudent: async (_studentId: string) => {},
  savePayment: async (_payment: unknown) => {},
  savePayments: async (_payments: unknown[]) => {},
  deletePayment: async (_paymentId: string) => {},
};

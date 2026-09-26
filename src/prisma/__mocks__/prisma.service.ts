import { jest } from '@jest/globals';

export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  menuItem: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};
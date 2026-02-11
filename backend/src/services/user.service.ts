// filepath: backend/src/services/user.service.ts
import { prisma } from '../db/prisma';

export const userService = {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  },

  async createUser(name: string, email: string) {
    return prisma.user.create({
      data: {
        name,
        email,
      },
    });
  },
};
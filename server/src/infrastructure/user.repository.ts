import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRepository, CreateUserDTO, UpdateUserDTO, User as UserEntity } from '../repositories/interfaces';

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }

  async create(data: CreateUserDTO): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        timezone: data.timezone || 'America/Argentina/Buenos_Aires',
      },
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }

  async update(id: number, data: UpdateUserDTO): Promise<UserEntity> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        timezone: data.timezone,
      },
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }
}

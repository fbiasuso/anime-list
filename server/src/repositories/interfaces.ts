export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}

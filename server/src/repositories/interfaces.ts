export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  timezone: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface UpdateUserDTO {
  timezone?: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: number, data: UpdateUserDTO): Promise<User>;
}

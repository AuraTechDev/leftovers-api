import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = new User({
      id: uuidv4(),
      name,
      email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User);

    return this.usersRepository.create(user);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.delete(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
    private readonly jwt: JwtService,
  ) {}

  private generateRandomPassword(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  create(createAuthDto: CreateAuthDto) {
    const { users } = createAuthDto;

    return Promise.all(
      users.map(async (user) => {
        const newUser = new User();
        newUser.carnet = user.carnet;
        newUser.nombre = user.nombre;
        newUser.correo = user.correo;

        // Generar contraseña aleatoria segura (por ejemplo 10 caracteres)
        const plainPassword = this.generateRandomPassword(10);

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(plainPassword, salt);

        await this.usersRepository.save(newUser);

        return {
          carnet: newUser.carnet,
          password: plainPassword,
        };
      }),
    );
  }

  async login(carnet: string, password: string) {
    try {
      const user = await this.usersRepository.findOneBy({ carnet });
      if (!user) {
        throw new NotFoundException({ message: 'Invalid Credential' });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = this.jwt.sign(
          { sub: user },
          { secret: 'secret', expiresIn: '1h' },
        );
        return { token };
      } else {
        throw new NotFoundException({ message: 'Invalid Credential' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw new NotFoundException({ message: 'Invalid Credential' });
    }
  }
}

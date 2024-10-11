import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DbService } from '../db/db.service';
import { LoginDto, RegisterDto } from './dto';
import * as argon from 'argon2';
import { emit } from 'process';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private db: DbService,
    private jwt: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const passwordHash = await argon.hash(registerDto.password);
    try {
      const user = await this.db.user.create({
        data: {
          email: registerDto.email,
          last_name: registerDto.last_name,
          first_name: registerDto.first_name,
          password: passwordHash,
        },
      });
      const tokens = await this.getTokens(user);
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.db.user.findFirst({
        where: {
          email: loginDto.email,
        },
      });

      if (!user) {
        throw new ForbiddenException('Incorrect credentials');
      }

      const isPassword = await argon.verify(user.password, loginDto.password);

      if (!isPassword) {
        throw new ForbiddenException('Incorrect credentials');
      }

      const tokens = await this.getTokens(user);
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async getTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '30m',
        algorithm: 'HS256',
      }),
      this.jwt.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
        algorithm: 'HS256',
      }),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}

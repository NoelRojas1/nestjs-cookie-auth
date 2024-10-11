import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private db: DbService) {}

  async updateUser(userId: number, editUserDto: EditUserDto) {
    const user = await this.db.user.update({
      where: {
        id: userId,
      },
      data: {
        ...editUserDto,
      },
    });

    const { password, ...rest } = user;
    return rest;
  }
}

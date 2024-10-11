import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtCookieGuard } from 'src/auth/guard';
import { Request } from 'express';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtCookieGuard)
  @Get()
  getMe(@GetUser() user: User) {
    return user;
  }

  @UseGuards(JwtCookieGuard)
  @Patch('update/:id')
  updateUser(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() editUserDto: EditUserDto,
  ) {
    if (+userId !== id) throw new ForbiddenException('Action denied');
    return this.userService.updateUser(id, editUserDto);
  }
}

import { IsString, IsDate } from 'class-validator';

import { Get, Post } from '&codename/http/Methods';
import {
  Query,
  Parameter,
  InjectService,
  Body,
} from '&codename/http/Arguments';
import { Service } from '&codename/di/Service';
import { StringFormat } from '&codename/http/constants';
import { Timer } from './Timer';

class Ty {
  id: string = '';
  age: string = '';
}

class BodyRequest {
  @IsString()
  age: string = '';

  @IsDate()
  bord: Date | null = null;

  get agePlus() {
    return this.age + this.bord?.toDateString();
  }
}

@Service()
export class UserController {
  private id = '12';

  @Get('/:age', { response: Ty })
  async getProfile(
    @InjectService() timer: Timer,
    @Parameter('age') age: string,
    @Query('userId', { format: StringFormat.Date }) userId: string | null,
  ) {
    console.log(timer);
    return { id: userId || this.id, age };
  }

  @Post('/profile', { response: Array.of(Ty) })
  async getProfile2(@Body() request: BodyRequest) {
    console.log(request);
    return [{ id: this.id, age: request.agePlus }];
  }
}

import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

enum AuthorizerType {
  USER,
  MECHANIC,
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-token')
  async createToken(
    @Body()
    body: {
      phone: string;
      authorizerType?: AuthorizerType;
      expiresIn?: string;
    },
  ) {
    if (
      !body.phone ||
      !body.phone
        .toString()
        .slice(-10)
        .match(/^[0-9]+$/)
    ) {
      throw new BadRequestException('Invalid/Missing phone number');
    }
    return this.authService.createToken(
      body.phone.toString().slice(-10),
      body.authorizerType,
      body.expiresIn,
    );
  }

  @Post('verify-token')
  async verifyToken(@Body() body: { token: string }) {
    return this.authService.verifyToken(body.token);
  }
}

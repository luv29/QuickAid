import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import jwt from 'jsonwebtoken';

enum AuthorizerType {
  USER,
  MECHANIC,
}

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async createToken(
    phone: string,
    authorizerType: AuthorizerType = AuthorizerType.USER,
    expiresIn?: string,
  ) {
    let authorizer;
    switch (authorizerType) {
      case AuthorizerType.USER:
        authorizer = await this.db.user.findUnique({
          where: { phoneNumber: phone },
        });
        break;
      case AuthorizerType.MECHANIC:
        authorizer = await this.db.mechanic.findUnique({
          where: { phoneNumber: phone },
        });
        break;
      default:
        throw new Error('Invalid authorizer type');
    }

    if (!authorizer) {
      throw new UnauthorizedException('Not authorized');
    }

    const token = jwt.sign(
      { id: authorizer.id, phoneNumber: authorizer.phoneNumber },
      process.env.JWT_SECRET!,
      {
        expiresIn: expiresIn || '30d',
      },
    );

    return { token };
  }

  async verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }
}

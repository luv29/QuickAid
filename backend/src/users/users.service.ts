import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import JWT from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    return await this.db.user.create({
      data: createUserDto,
    });
  }

  async sync(phoneNumber: string) {
    const user = await this.findOne(phoneNumber);
    if (!user) {
      return await this.create({ phoneNumber });
    }
    return user;
  }

  async findMany({
    page,
    limit,
    where,
    select,
    include,
  }: {
    page?: number;
    limit?: number;
    select?: Prisma.UserSelect;
    where?: Prisma.UserWhereInput;
    include?: Prisma.UserInclude;
  }) {
    const queryOptions: Prisma.UserFindManyArgs = {};

    if (select) {
      queryOptions.select = select as Prisma.UserSelect;
    }

    if (include) {
      queryOptions.include = include as Prisma.UserInclude;
    }

    if (where) {
      queryOptions.where = where as Prisma.UserWhereInput;
    }

    queryOptions.skip = ((page || 1) - 1) * (limit || 10);
    queryOptions.take = limit || 10;

    const [users, total] = await Promise.all([
      this.db.user.findMany(queryOptions),
      this.db.user.count({
        where: queryOptions.where,
      }),
    ]);

    return {
      data: users,
      total,
      page: page || 1,
      limit: limit || 10,
    };
  }

  async findOne(identifier: string) {
    if (identifier.length === 10 && /^\d+$/.test(identifier)) {
      return await this.db.user.findUnique({
        where: {
          phoneNumber: identifier,
        },
      });
    }

    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      return await this.db.user.findUnique({
        where: {
          id: identifier,
        },
      });
    }

    return null;
  }

  async findOneWithOptions(
    id: string,
    include: Prisma.UserInclude,
    select: Prisma.UserSelect,
  ) {
    const queryOptions: Prisma.UserFindUniqueArgs = {
      where: { id },
    };

    if (include) {
      queryOptions.include = include as Prisma.UserInclude;
    }

    if (select) {
      queryOptions.select = select as Prisma.UserSelect;
    }

    return this.db.user.findUnique(queryOptions);
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    const user = await this.db.user.update({
      where: { id },
      data: updateUserDto,
    });
    return user;
  }

  async remove(id: string) {
    return await this.db.user.delete({ where: { id } });
  }

  async createToken(phone: string, expiresIn: string = '30d') {
    if (!phone) {
      throw new Error('Phone number is required');
    }
    const secret = process.env.JWT_SECRET!;

    const token = JWT.sign({ phoneNumber: phone }, secret, {
      expiresIn,
    });

    return { token };
  }

  async verifyToken(token: string) {
    const secret = process.env.JWT_SECRET!;
    const decoded = JWT.verify(token, secret);
    return decoded;
  }
}

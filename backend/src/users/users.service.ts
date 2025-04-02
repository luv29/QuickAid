import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.UserCreateInput) {
    return await this.db.user.create({
      data,
    });
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
      queryOptions.select = select;
    }
    if (include) {
      queryOptions.include = include;
    }
    if (where) {
      queryOptions.where = where;
    }
    queryOptions.skip = ((page || 1) - 1) * (limit || 10);
    queryOptions.take = limit || 10;

    const [users, total] = await Promise.all([
      this.db.user.findMany(queryOptions),
      this.db.user.count({ where: queryOptions.where }),
    ]);

    return { data: users, total, page: page || 1, limit: limit || 10 };
  }

  async findOne(
    id: string,
    include?: Prisma.UserInclude,
    select?: Prisma.UserSelect,
  ) {
    const queryOptions: Prisma.UserFindUniqueArgs = { where: { id } };
    
    if (include) {
      queryOptions.include = include;
    }
    if (select) {
      queryOptions.select = select;
    }
    
    return this.db.user.findUnique(queryOptions);
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await this.db.user.update({ 
      where: { id }, 
      data 
    });
  }

  async remove(id: string) {
    return await this.db.user.delete({ where: { id } });
  }
}
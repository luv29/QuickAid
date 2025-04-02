import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MechanicService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.MechanicCreateInput) {
    return await this.db.mechanic.create({
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
    select?: Prisma.MechanicSelect;
    where?: Prisma.MechanicWhereInput;
    include?: Prisma.MechanicInclude;
  }) {
    const queryOptions: Prisma.MechanicFindManyArgs = {};

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

    const [mechanics, total] = await Promise.all([
      this.db.mechanic.findMany(queryOptions),
      this.db.mechanic.count({ where: queryOptions.where }),
    ]);

    return { data: mechanics, total, page: page || 1, limit: limit || 10 };
  }

  async findOne(
    id: string,
    include?: Prisma.MechanicInclude,
    select?: Prisma.MechanicSelect,
  ) {
    const queryOptions: Prisma.MechanicFindUniqueArgs = { where: { id } };

    if (include) {
      queryOptions.include = include;
    }
    if (select) {
      queryOptions.select = select;
    }

    return this.db.mechanic.findUnique(queryOptions);
  }

  async update(id: string, data: Prisma.MechanicUpdateInput) {
    return await this.db.mechanic.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return await this.db.mechanic.delete({ where: { id } });
  }
}

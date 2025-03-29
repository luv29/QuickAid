import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ServiceRequestsService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.ServiceRequestCreateInput) {
    return this.db.serviceRequest.create({
      data,
    });
  }

  async findMany({
    page,
    limit,
    select,
    where,
    include,
  }: {
    page?: number;
    limit?: number;
    select?: Prisma.ServiceRequestSelect;
    where?: Prisma.ServiceRequestWhereInput;
    include?: Prisma.ServiceRequestInclude;
  }) {
    const queryOptions: Prisma.ServiceRequestFindManyArgs = {};

    if (select) {
      queryOptions.select = select;
    }

    if (where) {
      queryOptions.where = where;
    }

    if (include) {
      queryOptions.include = include;
    }

    queryOptions.skip = ((page || 1) - 1) * (limit || 10);
    queryOptions.take = limit || 10;

    const [serviceRequests, total] = await Promise.all([
      this.db.serviceRequest.findMany(queryOptions),
      this.db.serviceRequest.count({
        where: queryOptions.where,
      }),
    ]);

    return {
      data: serviceRequests,
      total,
      page: page || 1,
      limit: limit || 10,
      hasMore: (page || 1) * (limit || 10) < total,
    };
  }

  async findOne(
    id: string,
    include?: Prisma.ServiceRequestInclude,
    select?: Prisma.ServiceRequestSelect,
  ) {
    const queryOptions: Prisma.ServiceRequestFindUniqueArgs = {
      where: { id },
    };

    if (include) {
      queryOptions.include = include;
    }

    if (select) {
      queryOptions.select = select;
    }

    return this.db.serviceRequest.findUnique(queryOptions);
  }

  async update(id: string, data: Prisma.ServiceRequestUpdateInput) {
    return this.db.serviceRequest.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.db.serviceRequest.delete({
      where: { id },
    });
  }
}

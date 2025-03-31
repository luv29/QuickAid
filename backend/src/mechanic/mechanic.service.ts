import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import JWT from 'jsonwebtoken';

@Injectable()
export class MechanicService {
    constructor(private readonly db: DatabaseService) { }

    async create(createMechanicDto: Prisma.MechanicCreateInput) {
        return await this.db.mechanic.create({
            data: createMechanicDto,
        });
    }

    async sync(phoneNumber: string) {
        const mechanic = await this.findOne(phoneNumber);
        if (!mechanic) {
            return await this.create({ phoneNumber });
        }
        return mechanic;
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

    async findOne(identifier: string) {
        if (identifier.length === 10 && /^\d+$/.test(identifier)) {
            return await this.db.mechanic.findUnique({ where: { phoneNumber: identifier } });
        }

        if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
            return await this.db.mechanic.findUnique({ where: { id: identifier } });
        }

        return null;
    }

    async findOneWithOptions(
        id: string,
        include: Prisma.MechanicInclude,
        select: Prisma.MechanicSelect,
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

    async update(id: string, updateMechanicDto: Prisma.MechanicUpdateInput) {
        return await this.db.mechanic.update({ where: { id }, data: updateMechanicDto });
    }

    async remove(id: string) {
        return await this.db.mechanic.delete({ where: { id } });
    }

    async createToken(phone: string, expiresIn: string = '30d') {
        if (!phone) {
            throw new Error('Phone number is required');
        }
        const secret = process.env.JWT_SECRET!;
        return { token: JWT.sign({ phoneNumber: phone }, secret, { expiresIn }) };
    }

    async verifyToken(token: string) {
        const secret = process.env.JWT_SECRET!;
        return JWT.verify(token, secret);
    }
}
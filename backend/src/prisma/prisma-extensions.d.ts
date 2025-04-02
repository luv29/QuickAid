import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

declare module './prisma.service' {
  interface PrismaService {
    $queryRaw<T = unknown>(
      query: TemplateStringsArray | Prisma.Sql,
      ...values: any[]
    ): Promise<T>;
    $executeRaw(
      query: TemplateStringsArray | Prisma.Sql,
      ...values: any[]
    ): Promise<number>;
  }
}

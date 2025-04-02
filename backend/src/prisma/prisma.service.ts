import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();

    try {
      await this.$runCommandRaw({
        createIndexes: 'Mechanic',
        indexes: [
          {
            key: {
              location: '2dsphere',
            },
            name: 'location_2dsphere',
          },
        ],
      });
      this.logger.log('Geospatial index created successfully');
    } catch (error) {
      // If index already exists, this is fine
      if (error.message && error.message.includes('already exists')) {
        this.logger.log('Geospatial index already exists');
      } else {
        this.logger.error('Failed to create geospatial index', error);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to clean up database during testing
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'production') {
      const models = Reflect.ownKeys(this).filter((key) => {
        return (
          typeof key === 'string' &&
          !key.startsWith('_') &&
          key !== '$connect' &&
          key !== '$disconnect' &&
          key !== '$on' &&
          key !== '$transaction' &&
          key !== '$use'
        );
      });

      return Promise.all(
        models.map((modelKey) => {
          return this[modelKey as string].deleteMany();
        }),
      );
    }
  }
}

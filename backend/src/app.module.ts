import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';

@Module({
  imports: [AuthModule, DatabaseModule, UsersModule, MessagesModule, ServiceRequestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

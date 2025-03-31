import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { MechanicModule } from './mechanic/mechanic.module';
import { PaymentServiceModule } from './payment-service/payment-service.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [AuthModule, DatabaseModule, UsersModule, MessagesModule, ServiceRequestsModule, MechanicModule, PaymentServiceModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

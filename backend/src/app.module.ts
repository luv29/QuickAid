import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { MechanicModule } from './mechanic/mechanic.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [AuthModule, DatabaseModule, UsersModule, MessagesModule, MechanicModule, PaymentModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

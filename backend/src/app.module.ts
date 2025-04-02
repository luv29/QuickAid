import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { PrismaModule } from './prisma/prisma.module';
import { DistanceCalculationModule } from './distance-calculation/distance-calculation.module';
import { CostCalculationModule } from './cost-calculation/cost-calculation.module';
import { NotificationModule } from './notification/notification.module';
import { BookingModule } from './booking/booking.module';
import { SosModule } from './sos/sos.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { MechanicModule } from './mechanic/mechanic.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    MessagesModule,
    ServiceRequestsModule,
    PrismaModule,
    DistanceCalculationModule,
    CostCalculationModule,
    NotificationModule,
    BookingModule,
    SosModule,
    MailModule,
    MechanicModule,
    PaymentModule,
    ReviewsModule,
  ],

  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}

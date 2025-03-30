import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
// import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { SosModule } from './sos/sos.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [AuthModule, DatabaseModule, UsersModule, MessagesModule, SosModule, MailModule],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}

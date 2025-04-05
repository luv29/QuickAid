import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MailService],
})
export class MailModule {}

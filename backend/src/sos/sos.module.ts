import { Module } from '@nestjs/common';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [DatabaseModule],
  providers: [SosService, MailService],
  exports: [SosService],
  controllers: [SosController],
})
export class SosModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StickersModule } from './stickers/stickers.module';

@Module({
  imports: [PrismaModule, StickersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { NdrrmaService } from './ndrrma.service';

@Module({
  providers: [NdrrmaService],
  exports: [NdrrmaService],
})
export class NdrrmaModule {}

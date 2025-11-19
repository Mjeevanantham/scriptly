import { Module } from '@nestjs/common'
import { CollaborationController } from './collaboration.controller'
import { CollaborationService } from './collaboration.service'

// Placeholder module for Phase 3 real-time collaboration
@Module({
  controllers: [CollaborationController],
  providers: [CollaborationService],
  exports: [CollaborationService],
})
export class CollaborationModule {}


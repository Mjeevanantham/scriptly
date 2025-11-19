import { Controller, Get, Post, Param, Body } from '@nestjs/common'
import { CollaborationService } from './collaboration.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Collaboration')
@Controller('collaboration')
export class CollaborationController {
  constructor(
    private readonly collaborationService: CollaborationService
  ) {}

  @Get('sessions/:projectId')
  @ApiOperation({ summary: 'Get collaboration session (Phase 3)' })
  getSession(@Param('projectId') projectId: string) {
    return this.collaborationService.getSession(projectId)
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create collaboration session (Phase 3)' })
  createSession(@Body() createSessionDto: any) {
    return this.collaborationService.createSession(createSessionDto)
  }
}


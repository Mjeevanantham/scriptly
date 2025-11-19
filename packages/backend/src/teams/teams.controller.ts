import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all teams (Phase 3)' })
  findAll() {
    return this.teamsService.findAll()
  }

  @Post()
  @ApiOperation({ summary: 'Create team (Phase 3)' })
  create(@Body() createTeamDto: any) {
    return this.teamsService.create(createTeamDto)
  }
}


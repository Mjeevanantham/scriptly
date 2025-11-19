import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects (Phase 3)' })
  findAll() {
    return this.projectsService.findAll()
  }

  @Post()
  @ApiOperation({ summary: 'Create project (Phase 3)' })
  create(@Body() createProjectDto: any) {
    return this.projectsService.create(createProjectDto)
  }
}


import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { FilesService } from './files.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':projectId')
  @ApiOperation({ summary: 'Get files for project (Phase 3)' })
  findByProject(@Param('projectId') projectId: string) {
    return this.filesService.findByProject(projectId)
  }

  @Post()
  @ApiOperation({ summary: 'Create file (Phase 3)' })
  create(@Body() createFileDto: any) {
    return this.filesService.create(createFileDto)
  }
}


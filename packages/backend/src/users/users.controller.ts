import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { UsersService } from './users.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (Phase 3)' })
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Phase 3)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create user (Phase 3)' })
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (Phase 3)' })
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (Phase 3)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}


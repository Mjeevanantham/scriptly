import { Controller, Get } from '@nestjs/common'
import { HealthService } from './health.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    return this.healthService.check()
  }
}


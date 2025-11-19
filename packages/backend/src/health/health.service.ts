import { Injectable } from '@nestjs/common'

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'scriptly-api',
      version: '0.1.0',
    }
  }
}


import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Scriptly API - Phase 3 (SaaS) - Coming Soon'
  }
}

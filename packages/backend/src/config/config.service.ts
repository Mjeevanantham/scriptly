import { Injectable } from '@nestjs/common'

@Injectable()
export class ConfigService {
  get(key: string): string | undefined {
    return process.env[key]
  }

  getDatabaseUrl(): string {
    return (
      this.get('DATABASE_URL') ||
      'postgresql://user:password@localhost:5432/scriptly'
    )
  }

  getJwtSecret(): string {
    return this.get('JWT_SECRET') || 'default-secret-change-in-production'
  }

  getFrontendUrl(): string {
    return this.get('FRONTEND_URL') || 'http://localhost:3000'
  }
}


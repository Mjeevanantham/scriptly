import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TeamsModule } from './teams/teams.module'
import { ProjectsModule } from './projects/projects.module'
import { FilesModule } from './files/files.module'
import { CollaborationModule } from './collaboration/collaboration.module'
import { ConfigModule } from './config/config.module'

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    ProjectsModule,
    FilesModule,
    CollaborationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

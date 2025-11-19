import { Injectable } from '@nestjs/common'

@Injectable()
export class ProjectsService {
  findAll() {
    return {
      message: 'Project management not implemented yet (Phase 3)',
      projects: [],
    }
  }

  create(createProjectDto: any) {
    return {
      message: 'Project creation not implemented yet (Phase 3)',
      createProjectDto,
    }
  }
}


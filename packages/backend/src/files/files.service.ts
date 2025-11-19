import { Injectable } from '@nestjs/common'

@Injectable()
export class FilesService {
  findByProject(projectId: string) {
    return {
      message: 'File storage not implemented yet (Phase 3)',
      projectId,
      files: [],
    }
  }

  create(createFileDto: any) {
    return {
      message: 'File creation not implemented yet (Phase 3)',
      createFileDto,
    }
  }
}


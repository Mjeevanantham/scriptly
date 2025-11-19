import { Injectable } from '@nestjs/common'

@Injectable()
export class CollaborationService {
  getSession(projectId: string) {
    return {
      message: 'Collaboration not implemented yet (Phase 3)',
      projectId,
      session: null,
    }
  }

  createSession(createSessionDto: any) {
    return {
      message: 'Session creation not implemented yet (Phase 3)',
      createSessionDto,
    }
  }
}


import { Controller, Get } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Get('admin/audit-logs')
  listAdmin() {
    return this.auditService.listRecent();
  }
}

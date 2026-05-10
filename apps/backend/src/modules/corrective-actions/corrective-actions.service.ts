import { Injectable } from '@nestjs/common'

@Injectable()
export class CorrectiveActionsService {
  private records: any[] = []

  findAll(tenantId: string, query: any) {
    return { data: this.records.filter(r => r.tenantId === tenantId), total: 0 }
  }

  create(tenantId: string, dto: any) {
    const record = { id: Date.now().toString(), tenantId, ...dto, status: 'open', createdAt: new Date() }
    this.records.push(record)
    return record
  }

  getStats(tenantId: string) {
    const items = this.records.filter(r => r.tenantId === tenantId)
    return { total: items.length, open: 0, inProgress: 0, closed: 0, overdue: 0 }
  }
}

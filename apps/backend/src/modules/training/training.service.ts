import { Injectable } from '@nestjs/common'

@Injectable()
export class TrainingService {
  private records: any[] = []

  findAll(tenantId: string, query: any) {
    // TODO: replace with TypeORM repo
    return { data: this.records.filter(r => r.tenantId === tenantId), total: 0 }
  }

  create(tenantId: string, dto: any) {
    const record = { id: Date.now().toString(), tenantId, ...dto, createdAt: new Date() }
    this.records.push(record)
    return record
  }

  getStats(tenantId: string) {
    const tenantRecords = this.records.filter(r => r.tenantId === tenantId)
    return { total: tenantRecords.length, upcoming: 0, expired: 0, completed: 0 }
  }
}

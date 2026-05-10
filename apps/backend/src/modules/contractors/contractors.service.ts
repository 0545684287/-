import { Injectable } from '@nestjs/common'

@Injectable()
export class ContractorsService {
  private records: any[] = []

  findAll(tenantId: string, query: any) {
    return { data: this.records.filter(r => r.tenantId === tenantId), total: 0 }
  }

  create(tenantId: string, dto: any) {
    const record = { id: Date.now().toString(), tenantId, ...dto, entryTime: new Date(), createdAt: new Date() }
    this.records.push(record)
    return record
  }

  checkout(tenantId: string, id: string) {
    const record = this.records.find(r => r.id === id && r.tenantId === tenantId)
    if (record) record.exitTime = new Date()
    return record
  }

  getActiveVisitors(tenantId: string) {
    return this.records.filter(r => r.tenantId === tenantId && !r.exitTime)
  }
}

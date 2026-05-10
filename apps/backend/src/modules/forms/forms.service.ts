import { Injectable } from '@nestjs/common'

@Injectable()
export class FormsService {
  private forms: any[] = []
  private submissions: any[] = []

  findAll(tenantId: string, query: any) {
    return { data: this.forms.filter(f => f.tenantId === tenantId), total: 0 }
  }

  create(tenantId: string, dto: any) {
    const form = { id: Date.now().toString(), tenantId, ...dto, createdAt: new Date() }
    this.forms.push(form)
    return form
  }

  submit(tenantId: string, formId: string, answers: any[], userId: string) {
    const submission = { id: Date.now().toString(), tenantId, formId, answers, submittedBy: userId, submittedAt: new Date() }
    this.submissions.push(submission)
    return submission
  }

  getStats(tenantId: string) {
    return { total: this.forms.filter(f => f.tenantId === tenantId).length, pending: 0, completed: 0, overdue: 0 }
  }
}

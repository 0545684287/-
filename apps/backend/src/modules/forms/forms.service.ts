import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FormTemplateEntity } from '../../database/entities/form-template.entity'
import { FormSubmissionEntity, SubmissionStatus } from '../../database/entities/form-submission.entity'

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(FormTemplateEntity) private templateRepo: Repository<FormTemplateEntity>,
    @InjectRepository(FormSubmissionEntity) private submissionRepo: Repository<FormSubmissionEntity>,
  ) {}

  async findAll(tenantId: string, query: any) {
    const qb = this.templateRepo.createQueryBuilder('t')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.isActive = true')

    if (query.category) qb.andWhere('t.category = :category', { category: query.category })
    if (query.search) qb.andWhere('t.title ILIKE :s', { s: `%${query.search}%` })

    const [data, total] = await qb.orderBy('t.createdAt', 'DESC').getManyAndCount()
    return { data, total }
  }

  async create(tenantId: string, dto: any) {
    const template = this.templateRepo.create({ ...dto, tenantId })
    return this.templateRepo.save(template)
  }

  async update(tenantId: string, id: string, dto: any) {
    const template = await this.templateRepo.findOne({ where: { id, tenantId } })
    if (!template) throw new NotFoundException()
    Object.assign(template, dto)
    template.version = (template.version || 1) + 1
    return this.templateRepo.save(template)
  }

  async getSubmissions(tenantId: string, query: any) {
    const qb = this.submissionRepo.createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId })

    if (query.templateId) qb.andWhere('s.templateId = :templateId', { templateId: query.templateId })
    if (query.siteId) qb.andWhere('s.siteId = :siteId', { siteId: query.siteId })
    if (query.status) qb.andWhere('s.status = :status', { status: query.status })

    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    qb.skip((page - 1) * limit).take(limit).orderBy('s.createdAt', 'DESC')

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async submit(tenantId: string, templateId: string, data: any, userId: string, siteId?: string) {
    const template = await this.templateRepo.findOne({ where: { id: templateId, tenantId } })
    if (!template) throw new NotFoundException('Form template not found')
    const submission = this.submissionRepo.create({
      tenantId,
      templateId,
      data,
      submittedById: userId,
      siteId,
      status: SubmissionStatus.SUBMITTED,
    })
    return this.submissionRepo.save(submission)
  }

  async getStats(tenantId: string) {
    const [totalTemplates, totalSubmissions, pendingReview, approved] = await Promise.all([
      this.templateRepo.count({ where: { tenantId, isActive: true } }),
      this.submissionRepo.count({ where: { tenantId } }),
      this.submissionRepo.count({ where: { tenantId, status: SubmissionStatus.SUBMITTED } }),
      this.submissionRepo.count({ where: { tenantId, status: SubmissionStatus.APPROVED } }),
    ])
    return { totalTemplates, totalSubmissions, pendingReview, approved }
  }
}

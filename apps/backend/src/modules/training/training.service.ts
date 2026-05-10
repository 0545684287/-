import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'
import { TrainingCourseEntity, TrainingType } from '../../database/entities/training-course.entity'
import { TrainingEnrollmentEntity, EnrollmentStatus } from '../../database/entities/training-enrollment.entity'

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingCourseEntity) private courseRepo: Repository<TrainingCourseEntity>,
    @InjectRepository(TrainingEnrollmentEntity) private enrollRepo: Repository<TrainingEnrollmentEntity>,
  ) {}

  async getCourses(tenantId: string, query: any) {
    const qb = this.courseRepo.createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isActive = true')

    if (query.type) qb.andWhere('c.type = :type', { type: query.type })
    if (query.siteId) qb.andWhere('(c.siteId = :siteId OR c.siteId IS NULL)', { siteId: query.siteId })
    if (query.search) qb.andWhere('c.title ILIKE :search', { search: `%${query.search}%` })

    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    qb.skip((page - 1) * limit).take(limit).orderBy('c.createdAt', 'DESC')

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async createCourse(tenantId: string, dto: any) {
    const course = this.courseRepo.create({ ...dto, tenantId })
    return this.courseRepo.save(course)
  }

  async updateCourse(tenantId: string, id: string, dto: any) {
    const course = await this.courseRepo.findOne({ where: { id, tenantId } })
    if (!course) throw new NotFoundException()
    Object.assign(course, dto)
    return this.courseRepo.save(course)
  }

  async deleteCourse(tenantId: string, id: string) {
    const course = await this.courseRepo.findOne({ where: { id, tenantId } })
    if (!course) throw new NotFoundException()
    course.isActive = false
    return this.courseRepo.save(course)
  }

  async getEnrollments(tenantId: string, query: any) {
    const qb = this.enrollRepo.createQueryBuilder('e')
      .where('e.tenantId = :tenantId', { tenantId })

    if (query.employeeId) qb.andWhere('e.employeeId = :employeeId', { employeeId: query.employeeId })
    if (query.courseId) qb.andWhere('e.courseId = :courseId', { courseId: query.courseId })
    if (query.status) qb.andWhere('e.status = :status', { status: query.status })

    const [data, total] = await qb.orderBy('e.createdAt', 'DESC').getManyAndCount()
    return { data, total }
  }

  async enroll(tenantId: string, dto: { employeeId: string; courseId: string; scheduledAt?: Date }) {
    const existing = await this.enrollRepo.findOne({
      where: { tenantId, employeeId: dto.employeeId, courseId: dto.courseId },
    })
    if (existing) {
      existing.status = EnrollmentStatus.PENDING
      existing.scheduledAt = dto.scheduledAt
      return this.enrollRepo.save(existing)
    }
    const enrollment = this.enrollRepo.create({ ...dto, tenantId, status: EnrollmentStatus.PENDING })
    return this.enrollRepo.save(enrollment)
  }

  async completeEnrollment(tenantId: string, id: string, dto: { score?: number; notes?: string }) {
    const enrollment = await this.enrollRepo.findOne({ where: { id, tenantId } })
    if (!enrollment) throw new NotFoundException()

    const course = await this.courseRepo.findOne({ where: { id: enrollment.courseId } })
    enrollment.status = EnrollmentStatus.COMPLETED
    enrollment.completedAt = new Date()
    enrollment.score = dto.score
    enrollment.notes = dto.notes
    if (course?.certificationValidityDays) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + course.certificationValidityDays)
      enrollment.expiresAt = expiry
    }
    return this.enrollRepo.save(enrollment)
  }

  async getStats(tenantId: string) {
    const now = new Date()
    const [totalCourses, totalEnrollments, completed, expired] = await Promise.all([
      this.courseRepo.count({ where: { tenantId, isActive: true } }),
      this.enrollRepo.count({ where: { tenantId } }),
      this.enrollRepo.count({ where: { tenantId, status: EnrollmentStatus.COMPLETED } }),
      this.enrollRepo.count({ where: { tenantId, status: EnrollmentStatus.EXPIRED } }),
    ])
    return { totalCourses, totalEnrollments, completed, expired }
  }
}

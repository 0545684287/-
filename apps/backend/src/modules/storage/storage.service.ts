import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class StorageService {
  private s3: S3Client
  private bucket: string

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get('storage.bucket')
    this.s3 = new S3Client({
      endpoint: config.get('storage.endpoint'),
      region: config.get('storage.region'),
      credentials: {
        accessKeyId: config.get('storage.accessKey'),
        secretAccessKey: config.get('storage.secretKey'),
      },
    })
  }

  async uploadFile(tenantId: string, file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    const ext = file.originalname.split('.').pop()
    const key = `${tenantId}/${folder}/${uuidv4()}.${ext}`

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }))

    return `${this.config.get('storage.endpoint')}/${this.bucket}/${key}`
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.split(`${this.bucket}/`)[1]
    if (!key) return
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }
}

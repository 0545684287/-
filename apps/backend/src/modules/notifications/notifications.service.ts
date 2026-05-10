import { Injectable, Logger } from '@nestjs/common'

export type NotificationChannel = 'push' | 'email' | 'sms' | 'whatsapp'

export interface SendNotificationDto {
  title: string
  body: string
  type?: string
  channels?: NotificationChannel[]
  data?: Record<string, any>
}

export interface NotificationResult {
  tenantId: string
  userId: string
  channels: Record<NotificationChannel, boolean>
  sentAt: Date
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  async send(
    tenantId: string,
    userId: string,
    notification: SendNotificationDto,
  ): Promise<NotificationResult> {
    const { title, body, type = 'general', channels = ['push'] } = notification
    const results: Record<NotificationChannel, boolean> = {
      push: false,
      email: false,
      sms: false,
      whatsapp: false,
    }

    this.logger.log(
      `Sending notification to user ${userId} in tenant ${tenantId}: [${channels.join(', ')}] ${title}`,
    )

    await Promise.all(
      channels.map(async (channel) => {
        switch (channel) {
          case 'push':
            results.push = await this.sendPush(userId, title, body, type)
            break
          case 'email':
            results.email = await this.sendEmail(userId, title, body)
            break
          case 'sms':
            results.sms = await this.sendSms(userId, body)
            break
          case 'whatsapp':
            results.whatsapp = await this.sendWhatsApp(userId, body)
            break
        }
      }),
    )

    return { tenantId, userId, channels: results, sentAt: new Date() }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    // TODO: Integrate with an email provider such as SendGrid, SES, or Nodemailer.
    // Example: await this.mailerService.send({ to, subject, html: body })
    this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
    console.log(`[EMAIL PLACEHOLDER] To: ${to}\nSubject: ${subject}\nBody: ${body}`)
    return true
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    // TODO: Integrate with an SMS provider such as Twilio or AWS SNS.
    // Example: await this.twilioClient.messages.create({ to: phone, from: FROM_NUMBER, body: message })
    this.logger.log(`[SMS] To: ${phone}`)
    console.log(`[SMS PLACEHOLDER] To: ${phone}\nMessage: ${message}`)
    return true
  }

  async sendWhatsApp(phone: string, message: string): Promise<boolean> {
    // TODO: Integrate with WhatsApp Business API or Twilio WhatsApp channel.
    // Example: await this.twilioClient.messages.create({ to: `whatsapp:${phone}`, body: message })
    this.logger.log(`[WHATSAPP] To: ${phone}`)
    console.log(`[WHATSAPP PLACEHOLDER] To: ${phone}\nMessage: ${message}`)
    return true
  }

  private async sendPush(
    userId: string,
    title: string,
    body: string,
    type: string,
  ): Promise<boolean> {
    // TODO: Integrate with a push notification provider such as Firebase Cloud Messaging (FCM)
    // or OneSignal. Retrieve the user's device token from the database first.
    // Example: await this.fcm.send({ token: deviceToken, notification: { title, body }, data: { type } })
    this.logger.log(`[PUSH] To user: ${userId} | Title: ${title}`)
    console.log(`[PUSH PLACEHOLDER] UserId: ${userId}\nTitle: ${title}\nBody: ${body}\nType: ${type}`)
    return true
  }
}

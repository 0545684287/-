import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import configuration from './config/configuration'
import { TenantMiddleware } from './common/middleware/tenant.middleware'
import { AuditMiddleware } from './common/middleware/audit.middleware'
import { AuthModule } from './modules/auth/auth.module'
import { TenantsModule } from './modules/tenants/tenants.module'
import { UsersModule } from './modules/users/users.module'
import { HrModule } from './modules/hr/hr.module'
import { TrainingModule } from './modules/training/training.module'
import { EquipmentModule } from './modules/equipment/equipment.module'
import { CorrectiveActionsModule } from './modules/corrective-actions/corrective-actions.module'
import { ContractorsModule } from './modules/contractors/contractors.module'
import { FormsModule } from './modules/forms/forms.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { SettingsModule } from './modules/settings/settings.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { AuditModule } from './modules/audit/audit.module'
import { StorageModule } from './modules/storage/storage.module'
import { AiModule } from './modules/ai/ai.module'
import { SitesModule } from './modules/sites/sites.module'
import { entities } from './database/entities'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('database.url'),
        entities,
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
        synchronize: config.get('app.env') === 'development',
        logging: config.get('app.env') === 'development',
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    TenantsModule,
    UsersModule,
    HrModule,
    TrainingModule,
    EquipmentModule,
    CorrectiveActionsModule,
    ContractorsModule,
    FormsModule,
    DashboardModule,
    SettingsModule,
    NotificationsModule,
    AuditModule,
    StorageModule,
    AiModule,
    SitesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware, AuditMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}

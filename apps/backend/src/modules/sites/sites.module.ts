import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SitesController } from './sites.controller'
import { SitesService } from './sites.service'
import { SiteEntity } from '../../database/entities/site.entity'
import { UserSiteRoleEntity } from '../../database/entities/user-site-role.entity'
import { UserEntity } from '../../database/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SiteEntity, UserSiteRoleEntity, UserEntity])],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}

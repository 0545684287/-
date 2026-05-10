import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AiService } from './ai.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  analyze(@Body('prompt') prompt: string, @Body('context') context?: string) {
    return this.aiService.analyze(prompt, context)
  }

  @Post('risk-assessment')
  assessRisk(@Body() data: any) {
    return this.aiService.assessRisk(data)
  }
}

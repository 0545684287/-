import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'

@Injectable()
export class AiService {
  private client: Anthropic

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ai.anthropicKey') })
  }

  async analyze(prompt: string, context?: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a workplace safety expert assistant for SafetyWork system.
               Respond in the language the user writes in. Be concise and practical.
               ${context ? `Context: ${context}` : ''}`,
      messages: [{ role: 'user', content: prompt }],
    })
    return (response.content[0] as any).text
  }

  async assessRisk(incidentData: any): Promise<{ score: number; recommendations: string[] }> {
    const prompt = `Assess the safety risk for this incident: ${JSON.stringify(incidentData)}.
                    Return a JSON with score (0-100) and recommendations array.`
    const raw = await this.analyze(prompt)
    try {
      return JSON.parse(raw)
    } catch {
      return { score: 50, recommendations: [raw] }
    }
  }

  async suggestCorrectiveAction(formData: any): Promise<string> {
    return this.analyze(
      `Based on this safety inspection result, suggest corrective actions: ${JSON.stringify(formData)}`,
    )
  }
}

import type { AgentDefinition } from './types'
import { SkillRegistry } from './skills'

export type Reflection = {
  success: boolean
  observations: string[]
  reusableProcedure?: string[]
  skillName?: string
}

export class EvolutionEngine {
  constructor(private readonly skills: SkillRegistry) {}

  reflect(agent: AgentDefinition, result: { success: boolean; output: string; observations?: string[]; procedure?: string[] }): Reflection {
    const observations = result.observations || []
    if (!result.success || !result.procedure?.length) return { success: result.success, observations }
    const skill = this.skills.crystallize({
      name: `${agent.name} procedure`,
      description: `Reusable procedure learned by ${agent.name}`,
      procedure: result.procedure,
    })
    return { success: true, observations, reusableProcedure: result.procedure, skillName: skill.id }
  }
}

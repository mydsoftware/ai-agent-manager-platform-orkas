import type { AgentDefinition, CommanderDecision, DispatchRequest, TaskPlan } from './types'
import { createPlan } from './plan'

export type CommanderInput = {
  goal: string
  agents: AgentDefinition[]
}

/**
 * Commander در این لایه مسئول تصمیم‌گیری سطح بالا است.
 * اجرای واقعی Workerها را به Dispatcher واگذار می‌کند.
 */
export class Commander {
  constructor(private readonly id = 'commander') {}

  chooseSpecialists(goal: string, agents: AgentDefinition[]): AgentDefinition[] {
    const terms = goal.toLowerCase().split(/\s+/).filter((term) => term.length > 1)
    return agents
      .map((agent) => {
        const corpus = `${agent.name} ${agent.description} ${agent.keywords.join(' ')}`.toLowerCase()
        const score = terms.reduce((sum, term) => sum + (corpus.includes(term) ? 1 : 0), 0)
        return { agent, score }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (b.agent.priority || 0) - (a.agent.priority || 0))
      .map((item) => item.agent)
  }

  decide(input: CommanderInput): CommanderDecision {
    const specialists = this.chooseSpecialists(input.goal, input.agents)
    if (!specialists.length) return { action: 'respond', text: 'هیچ Agent متخصص مناسبی برای این درخواست پیدا نشد.' }

    if (specialists.length === 1) {
      const agent = specialists[0]
      const request: DispatchRequest = {
        dispatchId: `dispatch_${Date.now().toString(36)}`,
        fromAgentId: this.id,
        toAgentId: agent.id,
        task: input.goal,
        mode: 'sequential',
      }
      return { action: 'dispatch', requests: [request] }
    }

    const items = specialists.map((agent, index) => ({
      id: `step_${index + 1}`,
      title: `Execute ${agent.name}`,
      ownerAgentId: agent.id,
    }))
    const plan: TaskPlan = createPlan(input.goal, items)
    return { action: 'plan', plan }
  }
}

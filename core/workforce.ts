import { Commander } from './commander'
import { Dispatcher, type WorkerExecutor } from './dispatcher'
import { VerificationEngine } from './verifier'
import type { AgentDefinition, AgentRunResult, CommanderDecision } from './types'

export type WorkforceEvent =
  | { type: 'decision'; decision: CommanderDecision }
  | { type: 'dispatch'; agentId: string; mode: 'parallel' | 'sequential' }
  | { type: 'verification'; pass: boolean; score: number; issues: string[] }
  | { type: 'completed'; output: string }

export type WorkforceOptions = {
  commanderId?: string
  verificationRules?: ConstructorParameters<typeof VerificationEngine>[0]
  executor: WorkerExecutor
  maxVerificationCycles?: number
}

/**
 * Orkas-inspired runtime برای پلتفرم اصلی.
 * این لایه orchestration را از API/DB/LLM جدا نگه می‌دارد تا بتوان
 * Workerهای واقعی پلتفرم را بدون تغییر قرارداد Commander متصل کرد.
 */
export class WorkforceRuntime {
  private readonly commander: Commander
  private readonly dispatcher: Dispatcher
  private readonly verifier: VerificationEngine
  private readonly maxCycles: number

  constructor(agents: AgentDefinition[], options: WorkforceOptions) {
    this.commander = new Commander(options.commanderId || 'commander')
    this.dispatcher = new Dispatcher(new Map(agents.map((agent) => [agent.id, agent])), options.executor)
    this.verifier = new VerificationEngine(options.verificationRules || [])
    this.maxCycles = Math.max(1, options.maxVerificationCycles || 3)
  }

  decide(goal: string, agents: AgentDefinition[]): CommanderDecision {
    return this.commander.decide({ goal, agents })
  }

  async run(goal: string, agents: AgentDefinition[], emit?: (event: WorkforceEvent) => void): Promise<AgentRunResult> {
    let decision = this.decide(goal, agents)
    emit?.({ type: 'decision', decision })

    if (decision.action === 'respond') {
      const result: AgentRunResult = { agentId: 'commander', text: decision.text, tokensUsed: 0, trace: [] }
      emit?.({ type: 'completed', output: result.text })
      return result
    }

    let final: AgentRunResult | undefined
    let cycle = 0
    let currentTask = goal

    while (cycle < this.maxCycles) {
      cycle++
      if (decision.action === 'dispatch') {
        const mode = decision.requests.some((r) => r.mode === 'sequential') ? 'sequential' : 'parallel'
        decision.requests.forEach((request) => emit?.({ type: 'dispatch', agentId: request.toAgentId, mode }))
        const results = await this.dispatcher.dispatchMany(decision.requests)
        final = combineResults(results)
      } else {
        const requests = decision.plan.items
          .filter((item) => item.ownerAgentId)
          .map((item) => ({
            dispatchId: `${decision.plan.id}:${item.id}`,
            fromAgentId: 'commander',
            toAgentId: item.ownerAgentId!,
            task: `${item.title}\nOriginal goal: ${decision.plan.goal}`,
            mode: 'sequential' as const,
          }))
        requests.forEach((request) => emit?.({ type: 'dispatch', agentId: request.toAgentId, mode: 'sequential' }))
        const results = await this.dispatcher.dispatchMany(requests)
        final = combineResults(results)
      }

      const verification = this.verifier.verify(goal, final.text)
      emit?.({ type: 'verification', ...verification })
      if (verification.pass) break

      currentTask = `${goal}\n\nPrevious output:\n${final.text}\n\nFix these issues:\n${verification.issues.join('\n')}`
      decision = this.decide(currentTask, agents)
      emit?.({ type: 'decision', decision })
      if (decision.action === 'respond') break
    }

    if (!final) final = { agentId: 'commander', text: 'No worker result produced.', tokensUsed: 0, trace: [] }
    emit?.({ type: 'completed', output: final.text })
    return final
  }
}

function combineResults(results: AgentRunResult[]): AgentRunResult {
  return {
    agentId: results.map((result) => result.agentId).join(','),
    text: results.map((result) => `[${result.agentId}]\n${result.text}`).join('\n\n'),
    tokensUsed: results.reduce((sum, result) => sum + result.tokensUsed, 0),
    trace: results.flatMap((result) => result.trace),
  }
}

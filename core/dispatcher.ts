import type { AgentDefinition, DispatchRequest, AgentRunResult } from './types'

export type WorkerExecutor = (agent: AgentDefinition, task: string, context: string) => Promise<AgentRunResult>

/**
 * Dispatch ساختاری است؛ متن آزاد LLM مستقیماً کنترل سیستم را در دست نمی‌گیرد.
 */
export class Dispatcher {
  constructor(private readonly agents: Map<string, AgentDefinition>, private readonly executor: WorkerExecutor) {}

  async dispatch(request: DispatchRequest, context = ''): Promise<AgentRunResult> {
    const agent = this.agents.get(request.toAgentId)
    if (!agent) throw new Error(`AGENT_NOT_FOUND:${request.toAgentId}`)
    return this.executor(agent, request.task, context)
  }

  async dispatchMany(requests: DispatchRequest[], contextByAgent: Map<string, string> = new Map()): Promise<AgentRunResult[]> {
    const sequential = requests.some((request) => request.mode === 'sequential')
    if (sequential) {
      const results: AgentRunResult[] = []
      for (const request of requests) {
        results.push(await this.dispatch(request, contextByAgent.get(request.toAgentId) || ''))
      }
      return results
    }
    return Promise.all(requests.map((request) => this.dispatch(request, contextByAgent.get(request.toAgentId) || '')))
  }
}

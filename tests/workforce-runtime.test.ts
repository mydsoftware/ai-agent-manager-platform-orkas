import { describe, expect, it } from 'vitest'
import { WorkforceRuntime } from '../core/workforce'
import type { AgentDefinition } from '../core/types'

const agents: AgentDefinition[] = [
  {
    id: 'seo', name: 'SEO Agent', description: 'technical seo', keywords: ['seo', 'google'], tools: [], systemPrompt: 'seo', priority: 10,
  },
  {
    id: 'dev', name: 'Developer Agent', description: 'web development', keywords: ['code', 'website'], tools: [], systemPrompt: 'dev', priority: 5,
  },
]

describe('WorkforceRuntime', () => {
  it('dispatches a matching specialist', async () => {
    const runtime = new WorkforceRuntime(agents, {
      executor: async (agent, task) => ({ agentId: agent.id, text: `done:${task}`, tokensUsed: 10, trace: [] }),
    })
    const result = await runtime.run('seo google', agents)
    expect(result.text).toContain('seo')
  })

  it('runs verification rules and retries when output fails', async () => {
    let calls = 0
    const runtime = new WorkforceRuntime(agents, {
      executor: async (agent) => ({ agentId: agent.id, text: ++calls === 1 ? 'bad' : 'fixed seo result', tokensUsed: 1, trace: [] }),
      verificationRules: [(goal, output) => output.includes('fixed') ? null : 'output must be fixed'],
      maxVerificationCycles: 2,
    })
    const result = await runtime.run('seo', agents)
    expect(calls).toBe(2)
    expect(result.text).toContain('fixed')
  })
})

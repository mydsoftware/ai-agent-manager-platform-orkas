import { describe, expect, it } from 'vitest'
import { Commander, Dispatcher, MemoryStore, SkillRegistry, VerificationEngine, visibleMessages, createPlan, nextRunnableItems, type AgentDefinition, type AgentMessage } from '../core'

describe('Orkas-inspired core', () => {
  const agents: AgentDefinition[] = [
    { id: 'seo', name: 'SEO Agent', description: 'technical SEO and search optimization', keywords: ['seo', 'google'], tools: [], systemPrompt: 'seo' },
    { id: 'dev', name: 'Developer Agent', description: 'coding and debugging', keywords: ['code', 'debug'], tools: [], systemPrompt: 'dev' },
  ]

  it('Commander selects a specialist and creates dispatch', () => {
    const decision = new Commander().decide({ goal: 'fix technical seo google issues', agents })
    expect(decision.action).toBe('dispatch')
    if (decision.action === 'dispatch') expect(decision.requests[0].toAgentId).toBe('seo')
  })

  it('dispatcher can execute multiple workers in parallel', async () => {
    const calls: string[] = []
    const dispatcher = new Dispatcher(new Map(agents.map((agent) => [agent.id, agent])), async (agent, task) => {
      calls.push(agent.id)
      return { agentId: agent.id, text: `${agent.name}: ${task}`, tokensUsed: 1, trace: [] }
    })
    const result = await dispatcher.dispatchMany([
      { dispatchId: '1', fromAgentId: 'commander', toAgentId: 'seo', task: 'analyze seo' },
      { dispatchId: '2', fromAgentId: 'commander', toAgentId: 'dev', task: 'fix code' },
    ])
    expect(result).toHaveLength(2)
    expect(calls.sort()).toEqual(['dev', 'seo'])
  })

  it('visibility slicing hides unrelated messages', () => {
    const messages: AgentMessage[] = [
      { id: '1', senderId: 'user', recipientId: 'commander', text: 'goal', createdAt: new Date().toISOString() },
      { id: '2', senderId: 'seo', recipientId: 'commander', text: 'seo result', createdAt: new Date().toISOString() },
      { id: '3', senderId: 'dev', recipientId: 'commander', text: 'dev result', createdAt: new Date().toISOString() },
    ]
    expect(visibleMessages(messages, 'seo').map((m) => m.id)).toEqual(['2'])
  })

  it('memory and skill stores retain reusable learning', () => {
    const memory = new MemoryStore()
    memory.save('seo', 'canonical tag should match preferred URL')
    expect(memory.search('seo', 'canonical')).toHaveLength(1)

    const skills = new SkillRegistry()
    const skill = skills.crystallize({ name: 'SEO canonical audit', description: 'canonical audit', procedure: ['check canonical', 'compare URL'] })
    expect(skill.confidence).toBeGreaterThan(0.5)
  })

  it('shared plan exposes runnable work', () => {
    const plan = createPlan('build website', [
      { id: 'research', title: 'research' },
      { id: 'build', title: 'build', dependencies: ['research'] },
    ])
    expect(nextRunnableItems(plan).map((item) => item.id)).toEqual(['research'])
  })

  it('verification fails when a rule reports an issue', () => {
    const verifier = new VerificationEngine([(goal, output) => output.includes(goal) ? null : 'goal missing'])
    expect(verifier.verify('SEO report', 'something else').pass).toBe(false)
  })
})

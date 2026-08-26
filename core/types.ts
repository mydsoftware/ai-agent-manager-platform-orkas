export type ExecutionMode = 'parallel' | 'sequential'
export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed'

export type AgentCapability = {
  id: string
  name: string
  description: string
  keywords: string[]
  tools: string[]
  priority?: number
}

export type AgentDefinition = AgentCapability & {
  systemPrompt: string
  model?: string
  status?: AgentStatus
}

export type DispatchRequest = {
  dispatchId: string
  fromAgentId: string
  toAgentId: string
  task: string
  mode?: ExecutionMode
  contextKeys?: string[]
}

export type TaskPlanItem = {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  ownerAgentId?: string
  dependencies?: string[]
  result?: unknown
  error?: string
}

export type TaskPlan = {
  id: string
  goal: string
  items: TaskPlanItem[]
}

export type AgentMessage = {
  id: string
  senderId: string
  recipientId: string
  text: string
  visibility?: string[]
  createdAt: string
}

export type AgentRunResult = {
  agentId: string
  text: string
  tokensUsed: number
  trace: unknown[]
}

export type CommanderDecision =
  | { action: 'respond'; text: string }
  | { action: 'dispatch'; requests: DispatchRequest[] }
  | { action: 'plan'; plan: TaskPlan }

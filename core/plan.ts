import type { TaskPlan, TaskPlanItem } from './types'

export function createPlan(goal: string, items: Array<Omit<TaskPlanItem, 'status'>>): TaskPlan {
  return {
    id: `plan_${Date.now().toString(36)}`,
    goal,
    items: items.map((item) => ({ ...item, status: 'pending' })),
  }
}

export function nextRunnableItems(plan: TaskPlan): TaskPlanItem[] {
  return plan.items.filter((item) => {
    if (item.status !== 'pending') return false
    return (item.dependencies || []).every((dependency) => plan.items.find((candidate) => candidate.id === dependency)?.status === 'completed')
  })
}

export function applyResult(plan: TaskPlan, itemId: string, result: unknown): TaskPlan {
  return {
    ...plan,
    items: plan.items.map((item) => item.id === itemId ? { ...item, status: 'completed', result } : item),
  }
}

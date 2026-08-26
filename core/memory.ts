export type MemoryRecord = {
  id: string
  agentId: string
  content: string
  metadata: Record<string, unknown>
  createdAt: string
}

export class MemoryStore {
  private readonly records: MemoryRecord[] = []

  save(agentId: string, content: string, metadata: Record<string, unknown> = {}): MemoryRecord {
    const record: MemoryRecord = {
      id: `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      agentId,
      content,
      metadata,
      createdAt: new Date().toISOString(),
    }
    this.records.push(record)
    return record
  }

  search(agentId: string, query: string, limit = 8): MemoryRecord[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    return this.records
      .filter((record) => record.agentId === agentId)
      .map((record) => ({ record, score: terms.reduce((score, term) => score + (record.content.toLowerCase().includes(term) ? 1 : 0), 0) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.record)
  }
}

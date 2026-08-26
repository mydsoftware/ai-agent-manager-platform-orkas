export type ModelCandidate = {
  id: string
  provider: string
  model: string
  quality: number
  cost: number
  latency: number
}

export class ModelRouter {
  select(candidates: ModelCandidate[], input: { qualityWeight?: number; costWeight?: number; latencyWeight?: number } = {}): ModelCandidate {
    if (!candidates.length) throw new Error('NO_MODEL_CANDIDATES')
    const qualityWeight = input.qualityWeight ?? 0.55
    const costWeight = input.costWeight ?? 0.25
    const latencyWeight = input.latencyWeight ?? 0.20
    return [...candidates].sort((a, b) => this.score(b, qualityWeight, costWeight, latencyWeight) - this.score(a, qualityWeight, costWeight, latencyWeight))[0]
  }

  private score(candidate: ModelCandidate, qualityWeight: number, costWeight: number, latencyWeight: number): number {
    return candidate.quality * qualityWeight + (1 / Math.max(candidate.cost, 0.01)) * costWeight + (1 / Math.max(candidate.latency, 1)) * latencyWeight
  }
}

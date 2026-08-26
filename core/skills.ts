export type Skill = {
  id: string
  name: string
  description: string
  procedure: string[]
  evidenceCount: number
  confidence: number
  createdAt: string
}

export class SkillRegistry {
  private readonly skills = new Map<string, Skill>()

  crystallize(input: { name: string; description: string; procedure: string[]; evidenceCount?: number }): Skill {
    const id = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `skill-${Date.now()}`
    const previous = this.skills.get(id)
    const evidenceCount = (previous?.evidenceCount || 0) + (input.evidenceCount || 1)
    const confidence = Math.min(1, 0.5 + evidenceCount * 0.1)
    const skill: Skill = {
      id,
      name: input.name,
      description: input.description,
      procedure: input.procedure,
      evidenceCount,
      confidence,
      createdAt: previous?.createdAt || new Date().toISOString(),
    }
    this.skills.set(id, skill)
    return skill
  }

  find(query: string): Skill[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    return [...this.skills.values()].filter((skill) => terms.some((term) => `${skill.name} ${skill.description}`.toLowerCase().includes(term)))
  }
}

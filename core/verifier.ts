export type VerificationResult = {
  pass: boolean
  score: number
  issues: string[]
}

export type VerificationRule = (goal: string, output: string) => string | null

export class VerificationEngine {
  constructor(private readonly rules: VerificationRule[] = []) {}

  verify(goal: string, output: string): VerificationResult {
    const issues = this.rules.map((rule) => rule(goal, output)).filter((issue): issue is string => Boolean(issue))
    const score = issues.length === 0 ? 1 : Math.max(0, 1 - issues.length / Math.max(this.rules.length, 1))
    return { pass: issues.length === 0, score, issues }
  }
}

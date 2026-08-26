export type ExternalAgentAdapter = {
  id: string
  name: string
  command: string
  available: () => Promise<boolean>
  run: (task: string, cwd?: string) => Promise<{ text: string; exitCode: number }>
}

export class ExternalAgentRegistry {
  private readonly adapters = new Map<string, ExternalAgentAdapter>()

  register(adapter: ExternalAgentAdapter): void {
    this.adapters.set(adapter.id, adapter)
  }

  get(id: string): ExternalAgentAdapter | undefined {
    return this.adapters.get(id)
  }

  list(): ExternalAgentAdapter[] {
    return [...this.adapters.values()]
  }
}

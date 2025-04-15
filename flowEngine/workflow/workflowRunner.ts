import { Flow } from "../types/flow";

export class WorkflowRunner {
  flow: Flow;

  constructor(flow: Flow) {
    this.flow = flow;
  }

  async run(): Promise<void> {
    await Promise.all(this.flow.steps.map(step => step.run()));
    this.flow.nextFlow && await new WorkflowRunner(this.flow.nextFlow).run();
  }
}


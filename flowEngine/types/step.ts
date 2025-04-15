export type Step = {
    id: string;
    name: string;
    type: string;
    status: string;
    run: () => Promise<void>; // Add the run method
  }; 
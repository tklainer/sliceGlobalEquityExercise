import { Step } from "./step";

export type Flow = {
  id: string; 
  steps: Step[];
  name: string; 
  nextFlow?: Flow
}
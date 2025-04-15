import { sendMail } from "../flowEngine/steps/sendMail";
import { updateStatus } from "../flowEngine/steps/updateStatus";
import { WorkflowRunner } from "../flowEngine/workflow/workflowRunner";
import { Step } from "../flowEngine/types/step";
import { Flow } from "../flowEngine/types/flow";

describe("WorkflowRunner", () => {
  it("should execute all steps in the flow", async () => {
    // Mock steps
    const mockStep1: Step = {
      id: "mockStep1",
      name: "Mock Step 1",
      type: "mock",
      status: "pending",
      run: jest.fn(async function () {
        this.status = "success";
      }),
    };

    const mockStep2: Step = {
      id: "mockStep2",
      name: "Mock Step 2",
      type: "mock",
      status: "pending",
      run: jest.fn(async function () {
        this.status = "success";
      }),
    };

    // Mock flow
    const mockFlow: Flow = {
      id: "mockFlow",
      name: "Mock Flow",
      steps: [mockStep1, mockStep2],
      nextFlow: undefined,
    };

    // Run the workflow
    const runner = new WorkflowRunner(mockFlow);
    await runner.run();

    // Assertions
    expect(mockStep1.run).toHaveBeenCalled();
    expect(mockStep2.run).toHaveBeenCalled();
    expect(mockStep1.status).toBe("success");
    expect(mockStep2.status).toBe("success");
  });

  it("should handle nested flows", async () => {  
    // Mock steps
    const mockStep1: Step = {
      id: "mockStep1",
      name: "Mock Step 1",
      type: "mock",
      status: "pending",
      run: jest.fn(async function () {
        this.status = "success";
      }),
    };

    const mockStep2: Step = {
      id: "mockStep2",
      name: "Mock Step 2",
      type: "mock",
      status: "pending",
      run: jest.fn(async function () {
        this.status = "success";
      }),
    };

    // Mock nested flow
    const nestedFlow: Flow = {
      id: "nestedFlow",
      name: "Nested Flow",
      steps: [mockStep2],
      nextFlow: undefined,
    };

    // Mock main flow
    const mainFlow: Flow = {
      id: "mainFlow",
      name: "Main Flow",
      steps: [mockStep1],
      nextFlow: nestedFlow,
    };

    // Run the workflow
    const runner = new WorkflowRunner(mainFlow);
    await runner.run();

    // Assertions
    expect(mockStep1.run).toHaveBeenCalled();
    expect(mockStep2.run).toHaveBeenCalled();
    expect(mockStep1.status).toBe("success");
    expect(mockStep2.status).toBe("success");
  }
  );  
  it("should handle step status updates", async () => {
    // Mock steps
    const mockStep: Step = {
      id: "mockStep",
      name: "Mock Step",
      type: "mock",
      status: "pending",
      run: jest.fn(async function () {
        this.status = "success";
      }),
    };

    // Mock flow
    const mockFlow: Flow = {
      id: "mockFlow",
      name: "Mock Flow",
      steps: [mockStep],
      nextFlow: undefined,
    };

    // Run the workflow
    const runner = new WorkflowRunner(mockFlow);
    await runner.run();

    // Assertions
    expect(mockStep.run).toHaveBeenCalled();
    expect(mockStep.status).toBe("success");
  }
  );
  it("should handle step status updates with updateStatus", async () => { 
    // Mock steps
    const notifyIrs: Step = {
      id: "notifyIrs",
      name: "Notify IRS",
      type: "notifyIrs",
      status: "pending",
      run: async function () {
        console.log(`Notifying IRS...${this.name}`);
      },
    };

    const notifyHr: Step = {
      id: "notifyHr",
      name: "Notify HR",
      type: "notifyHR",
      status: "pending",
      run: async function () {
        console.log(`Notifying HR...${this.name}`);
      },
    };

    // Define your flow with steps
    const flow: Flow = {
      id: "testFlow",
      name: "test flow",
      steps: [
        sendMail("sendStartEmail"),
        updateStatus(notifyHr, "Done"),
        updateStatus(notifyIrs, "Still in progress"),
      ],
      nextFlow: {
        id: "nextFlow",
        name: "next flow",
        steps: [
          sendMail("sendIrsEmail"),
          updateStatus(notifyIrs, "Got response"),
          // updateStatus(notifyIrs,'Done'), // if we try to update the status to 'Done' it will throw an error 
        ],
        nextFlow: {
          id: "irsDoneFlow",
          name: "irs donw flow",
          steps: [updateStatus(notifyIrs, "Done")],
          nextFlow: {
            id: "lastFlow",
            name: "last flow",
            steps: [sendMail("sendFinishEmail")],
          },
        },
      },
    };

    // Run the workflow
    const runner = new WorkflowRunner(flow);
    await runner.run();

    // Assertions
    expect(notifyHr.status).toBe("Done");
    expect(notifyIrs.status).toBe("Done");
  }  );
  it("should thow error as can not set step to done if in progress", async () => { 
    // Mock steps
    const notifyIrs: Step = {
      id: "notifyIrs",
      name: "Notify IRS",
      type: "notifyIrs",
      status: "pending",
      run: async function () {
        console.log(`Notifying IRS...${this.name}`);
      },
    };

    const notifyHr: Step = {
      id: "notifyHr",
      name: "Notify HR",
      type: "notifyHR",
      status: "pending",
      run: async function () {
        console.log(`Notifying HR...${this.name}`);
      },
    };

    // Define your flow with steps
    const flow: Flow = {
      id: "testFlow",
      name: "test flow",
      steps: [
        sendMail("sendStartEmail"),
        updateStatus(notifyHr, "Done"),
        updateStatus(notifyIrs, "Still in progress"),
      ],
      nextFlow: {
        id: "nextFlow",
        name: "next flow",
        steps: [
          sendMail("sendIrsEmail"),
          updateStatus(notifyIrs, "Got response"),
          updateStatus(notifyIrs,'Done'), // if we try to update the status to 'Done' it will throw an error 
        ],
        nextFlow:  {
            id: "lastFlow",
            name: "last flow",
            steps: [sendMail("sendFinishEmail")],
          },
        
      },
    };

    // Run the workflow
    const runner = new WorkflowRunner(flow);
    // Assertions
    await expect(runner.run()).rejects.toThrow(
      `Step ${notifyIrs.name} is still in progress and can only be updated to 'Got response'`
    );


  }  );
  it("should throw an error if step status is invalid", async () => { 
    // Mock steps
    const notifyIrs: Step = {
      id: "notifyIrs",
      name: "Notify IRS",
      type: "notifyIrs",
      status: "pending",
      run: async function () {
        console.log(`Notifying IRS...${this.name}`);
      },
    };

    const notifyHr: Step = {
      id: "notifyHr",
      name: "Notify HR",
      type: "notifyHR",
      status: "pending",
      run: async function () {
        console.log(`Notifying HR...${this.name}`);
      },
    };

    // Define your flow with steps
    const flow: Flow = {
      id: "testFlow",
      name: "test flow",
      steps: [
        sendMail("sendStartEmail"),
        updateStatus(notifyHr, "Done"),
        updateStatus(notifyIrs, "Still in progress"),
      ],
       nextFlow: {
        id: "lastFlow",
        name: "last flow",
        steps: [sendMail("sendFinishEmail"),updateStatus(notifyIrs, "Done"),],
      },
    };

    // Run the workflow
    const runner = new WorkflowRunner(flow);

    // Assertions
    await expect(runner.run()).rejects.toThrow(
      `Step ${notifyIrs.name} is still in progress and can only be updated to 'Got response'`
    );
  }
  );
  it("should handle async operations in steps", async () => { 
    // Mock steps
    const mockStep: Step = {
      id: "mockStep",
      name: "Mock Step",
      type: "mock",
      status: "pending",
      run: jest.fn(async function () {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
        this.status = "success";
      }),
    };

    // Mock flow
    const mockFlow: Flow = {
      id: "mockFlow",
      name: "Mock Flow",
      steps: [mockStep],
      nextFlow: undefined,
    };

    // Run the workflow
    const runner = new WorkflowRunner(mockFlow);
    await runner.run();

    // Assertions
    expect(mockStep.run).toHaveBeenCalled();
    expect(mockStep.status).toBe("success");
  }
  );
  it("should handle errors in steps", async () => { 
    // Mock steps
    const mockStep: Step = {
      id: "mockStep",
      name: "Mock Step",
      type: "mock",
      status: "pending",
      run: jest.fn(async function () {
        throw new Error("Step failed");
      }),
    };

    // Mock flow
    const mockFlow: Flow = {
      id: "mockFlow",
      name: "Mock Flow",
      steps: [mockStep],
      nextFlow: undefined,
    };

    // Run the workflow
    const runner = new WorkflowRunner(mockFlow);

    // Assertions
    await expect(runner.run()).rejects.toThrow("Step failed");
  }
  );
  it("should handle empty flows", async () => { 
    // Mock flow
    const emptyFlow: Flow = {
      id: "emptyFlow",
      name: "Empty Flow",
      steps: [],
      nextFlow: undefined,
    };

    // Run the workflow
    const runner = new WorkflowRunner(emptyFlow);
    await runner.run();

    // Assertions
    expect(runner.flow.steps.length).toBe(0);
  }
  );
  it("should handle flows with no nextFlow", async () => {    
    // Mock steps
    const mockStep: Step = {
      id: "mockStep",
      name: "Mock Step",
      type: "mock",
      status: "pending",
      run: jest.fn(async function () {
        this.status = "success";
      }),
    };

    // Mock flow
    const mockFlow: Flow = {
      id: "mockFlow",
      name: "Mock Flow",
      steps: [mockStep],
      nextFlow: undefined,
    };

    // Run the workflow
    const runner = new WorkflowRunner(mockFlow);
    await runner.run();

    // Assertions
    expect(mockStep.run).toHaveBeenCalled();
    expect(mockStep.status).toBe("success");
  } );
});
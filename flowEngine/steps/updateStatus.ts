import { Step } from "../types/step";

export const updateStatus=(step:Step,stepStatus:string): Step => {
    return {
        id: "updateStatus",
        name: "Update Status",
        type: "updateStatus",
        status: "pending",
        run: async function()  {
            console.log(`Update status from ${step.status} to ${stepStatus} ...${step.name}`);
            if(stepStatus === 'Got response'){
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
            }
            if(step.status === 'Still in progress' && stepStatus !== 'Got response') {
                throw new Error(`Step ${step.name} is still in progress and can only be updated to 'Got response'`);
            }
            step.status = stepStatus;
            this.status  = 'success';
        }
    }

};
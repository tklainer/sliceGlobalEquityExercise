import { sendMail } from "../steps/sendMail";
import { updateStatus } from "../steps/updateStatus";
import { Flow } from "../types/flow";
import { Step } from "../types/step";
import { WorkflowRunner } from "./workflowRunner";

async function main() {
const notifyIrs : Step={id:'notifyIrs',name:'Notify IRS',type:'notifyIrs',status:'pending',run:async function(){console.log(`Notifying IRS...${this.name}`);}};
const notifyHr : Step={id:'notifyHr',name:'Notify HR',type:'notifyHR',status:'pending',run:async function(){console.log(`Notifying HR...${this.name}`);}};
const flow: Flow = {
    id:'testFlow',
    name:'test flow',
    steps:[ 
        sendMail("sendStartEmail"),
        updateStatus(notifyHr,'Done'),
        updateStatus(notifyIrs,'Still in progress')
    ] ,
    nextFlow: {
        id:'nextFlow',
        name:'next flow',
        steps:[
            sendMail("sendIrsEmail"),
            updateStatus(notifyIrs,'Got response'),
            // updateStatus(notifyIrs,'Done'), // if we try to update the status to 'Done' it will throw an error 
        ],
        nextFlow: {
            id:'irsDoneFlow',
            name:'irs donw flow',
            steps:[
                updateStatus(notifyIrs,'Done'),
            ],
            nextFlow: {
                id:'lastFlow',
                name:'last flow',
                steps:[
                    sendMail("sendFinishEmail"),
                ],
            }
        }
    }
}; // Define your flow with steps
const runner = new WorkflowRunner(flow);
await runner.run();
}

main()
  .then(() => {
    console.log("Workflow test completed successfully");
  })
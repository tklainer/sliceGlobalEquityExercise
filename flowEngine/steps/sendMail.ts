import { Step } from "../types/step";

export const sendMail=(stepName:string): Step => {
    
    return {
        id: "sendMail",
        name: stepName,
        type: "sendMail",
        status: "pending",
        run: async function()  {
            console.log(`Sending email...${this.name}`); 
            this.status  = 'success';
        }
    }

};


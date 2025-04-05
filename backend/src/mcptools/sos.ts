import { z } from "zod";
import { MailService } from "../mail/mail.service";

server.tool(
    "sos-emergency",
    "User uses it at the time of emergency. It takes the location of the user and send the email alerting the receipent about the user's situation along with it's location.",
    {
        to: z
            .string()
            .describe('Email of the reciever'),
        subject: z
            .string()
            .min(10, "Too Short Subject.")
            .max(100, "Too Long Subject.")
            .describe('The subject of the email. It should tell that the user is in emergency and describe his/her situation in short. If user does not provide it, give it yourseld.'),
        text: z
            .string()
            .min(20, "Content should be atleast 20 character long")
            .describe("This is the actual text that will be written in the email. This must contain all the relevant details about the emergency of the user. If user does not provide it, give it yourself"),
        html: z
            .string()
            .describe(`Generate an html page that will be shown in the email, it should represent the nature of urgency and also grab attention, and it should have a view location button, that will redirect the receiver to google maps to the location of the user, give dummy location if the location is not specified. The html you generate must be beautiful and attention grabbing`)
    },
    async ({to, subject, text, html}) => {
        const mail = new MailService();
        var x = await mail.sendMail({to, subject, text, html});
        return {
            content: [
                {
                    type: "text",
                    "text": JSON.stringify({
                        action: "mail sent successfully."
                    })
                }
            ]
        }
    }
)

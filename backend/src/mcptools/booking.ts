import { BookingService } from "src/booking/booking.service";
import { CostCalculationService } from "src/cost-calculation/cost-calculation.service";
import { DistanceCalculationService } from "src/distance-calculation/distance-calculation.service";
import { MechanicDiscoveryService } from "src/mechanic-discovery/mechanic-discovery.service";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import server from "../utils/mcpserver";
import {z} from "zod";

const options = ["TOW", "LOCKOUT", "BATTERY_JUMP", "FUEL_DELIVERY", "TIRE_CHANGE", "JUMP_START", "ELECTRIC_CHARGING", "CAR_REPAIR", "CUSTOM_SERVICE"]

const bS = new BookingService(new PrismaService(), new MechanicDiscoveryService(new PrismaService()), new DistanceCalculationService(), new CostCalculationService(), new NotificationService(new PrismaService()));


server.tool(
    "initiateServiceRequest",
    "When user needs a service, this tool will be used to initiate the service.",
    {   
        userId: z
            .string()
            .describe("This is the mongoDB _id of the user whose reviews are to be fetched."),
        serviceType: z
            .enum(["TOW", "LOCKOUT", "BATTERY_JUMP", "FUEL_DELIVERY", "TIRE_CHANGE", "JUMP_START", "ELECTRIC_CHARGING", "CAR_REPAIR", "CUSTOM_SERVICE"])
            .describe(`This is the type of the service the user requests from the application, remember it should exactly be one of the following ${options}`),
        latitude: z
            .number()
            .describe("The latitude of the current location of the user."),
        longitude: z
            .number()
            .describe("The longitude of the current location of the user."),
        description: z
            .string()
            .min(30, "Too short description.")
            .describe("It should describe what is the actual need to call the service. If the user does not provide any details, ask them once to elaborate their issue, if they do, refine it, otherwise give description by your own."),
        address: z
            .string()
            .optional()
            .describe("It gives the nearby area or a landmark, to help in better navigation.")
    },
    async ({userId, serviceType, latitude, longitude, description, address}) => {
        try {
            const res = bS.initiateServiceRequest({userId, serviceType, latitude, longitude, description, address})
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            ...res
                        })
                    }
                ]
            }

        } catch(e) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            message: e.message
                        })
                    }
                ]
            }
        }
    }
)
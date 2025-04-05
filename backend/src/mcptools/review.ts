import server from "../utils/mcpserver";
import { z } from "zod";
import { ReviewsService } from "../reviews/reviews.service";
import { DatabaseService } from "../database/database.service";

const db = new DatabaseService()
const rS = new ReviewsService(db);

server.tool(
    "setrReviewAndRating",
    "This tool allows users to rate and review the services provided by the mechanics and leave them a comment",
    {
        serviceRequestId: z
            .string()
            .describe("represents _id of mongoDB. It is the _id of the document storing the service request being rated."),
        reviewerType: z
            .enum(["USER", "MECHANIC"])
            .describe("Represents who is rating. It could be either 'USER' or 'MECHANIC' "),
        rating: z
            .number()
            .int()
            .min(1)
            .max(5)
            .describe("The rating to be given."),
        comment: z
            .string()
            .optional()
            .describe("The comment given by the reviwer to who ever he is reviewing, if user does not give comment, ask him once whether he wants to give the comments.")
    },
    async ({serviceRequestId, reviewerType, rating, comment}) => {
        try {
            const x = await rS.createReview({serviceRequestId, reviewerType, rating, comment});
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            ...x
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

server.tool(
    "getReviewsByUser",
    "returns all the reviews given by a user.",
    {
        userId: z
            .string()
            .describe("This is the mongoDB _id of the user whose reviews are to be fetched.")
    },
    async ({userId}) => {
        try {
            let res = await rS.getReviewsByUser(userId)
            
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

server.tool(
    "getReviewsByMechanic",
    "returns all the reviews given by a mechanic.",
    {
        mechanicId: z
            .string()
            .describe("This is the mongoDB _id of the mechanic whose reviews are to be fetched.")
    },
    async ({ mechanicId }) => {
        try {
            let res = await rS.getReviewsByMechanic(mechanicId )
            
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

server.tool(
    "getReviewsAboutUser",
    "returns all the reviews about a user.",
    {
        userId: z
            .string()
            .describe("This is the mongoDB _id of the user whose reviews are to be fetched.")
    },
    async ({userId}) => {
        try {
            let res = await rS.getReviewsAboutUser(userId)
            
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

server.tool(
    "getReviewsAboutMechanic",
    "returns all the reviews given about a mechanic.",
    {
        mechanicId: z
            .string()
            .describe("This is the mongoDB _id of the mechanic whose reviews are to be fetched.")
    },
    async ({ mechanicId }) => {
        try {
            let res = await rS.getReviewsAboutMechanic(mechanicId )
            
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
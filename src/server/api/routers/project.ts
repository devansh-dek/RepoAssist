import { z } from "zod"
import { createTRPCRouter,protectedProcedure,publicProcedure } from "../trpc"

export const projectRouter=createTRPCRouter({
    createProject:protectedProcedure.input(
        z.object({
            name:z.string(),
            githubUrl:z.string(),
            githubToken:z.string().optional()
        })
    )
    .mutation(async({input,ctx})=>{
        console.log("User ID:", ctx.user.userId); // Log the userId
        console.log("Input:", input); // Log the input data
        const project=await ctx.db.project.create({
            data:{
                name:input.name,
                githubUrl:input.githubUrl,
                userToProjects:{
                    create:{
                        userId:ctx.user.userId!
                    }
                }
            }
        })
        return project;
    })
})
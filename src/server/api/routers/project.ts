import { z } from "zod"
import { createTRPCRouter,protectedProcedure,publicProcedure } from "../trpc"
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";
import { arch } from "os";
import { check } from "prettier";

export const projectRouter=createTRPCRouter({
    createProject:protectedProcedure.input(
        z.object({
            name:z.string(),
            githubUrl:z.string(),
            githubToken:z.string().optional()
        })
    )
    .mutation(async({input,ctx})=>{
        // console.log("User ID:", ctx.user.userId); // Log the userId
        // console.log("Input:", input); // Log the input data
        // backend validation for credits
        const user=await ctx.db.user.findUnique({where:{id:ctx.user.userId!},select:{credits:true}});
        if(!user){
            throw new Error("User not found");
        }

        const currentCredits=user.credits || 0;
        const fileCount=await checkCredits(input.githubUrl,input.githubToken);

        if(fileCount !== undefined && currentCredits < fileCount){
            throw new Error("Insufficient credits");
        }
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
        //jab project create hoga tabhi embeddings bhi nikal lo
        await indexGithubRepo(project.id,input.githubUrl,input.githubToken);
        await pollCommits(project.id);
        await ctx.db.user.update({where:{id:ctx.user.userId!},data:{credits:{decrement:fileCount}}})
        return project;
    }),
    getProjects:protectedProcedure.query(async({ctx})=>{
        return await ctx.db.project.findMany({
            where:{
                userToProjects:{
                    some:{
                        userId:ctx.user.userId!
                    }
                },
                deletedAt:null
            }
        })
    }),
    getCommits:protectedProcedure.input(z.object({
        projectId:z.string()
    })).query(async({ctx,input})=>{
        pollCommits(input.projectId).then().catch(console.error);
        return await ctx.db.commit.findMany({where:{projectId:input.projectId}})
    }),
    saveAnswer:protectedProcedure.input(z.object({
        projectId:z.string(),
        question:z.string(),
        answer:z.string(),
        fileReferences:z.any()
    })).mutation(async({ctx,input})=>{
        return await ctx.db.question.create({
            data:{
                projectId:input.projectId,
                question:input.question,
                answer:input.answer,
                fileReferences:input.fileReferences,
                userId:ctx.user.userId!
            }
        })
    }),
    getQuestions:protectedProcedure.input(z.object({projectId:z.string()})).query(async({ctx,input})=>{
        return await ctx.db.question.findMany({
            where:{
                projectId:input.projectId
            },
            include:{
                user:true
            },
            orderBy:{
                createdAt:"desc"
            }
        })
    }),
    uploadMeeting:protectedProcedure.input(z.object({projectId:z.string(),meetingUrl:z.string(),name:z.string()}))
    .mutation(async({ctx,input})=>{
        const meeting=await ctx.db.meeting.create({
            data:{
                meetingUrl:input.meetingUrl,
                projectId:input.projectId,
                name:input.name,
                status:"PROCESSING"
            }
        })
        return meeting;
    }),
    getMeetings:protectedProcedure.input(z.object({projectId:z.string()})).query(async({ctx,input})=>{
        return await ctx.db.meeting.findMany({
            where:{
                projectId:input.projectId
            },
            include:{
                issues:true
            }
        })
    }),
    deleteMeeting:protectedProcedure.input(z.object({meetingId:z.string()})).mutation(async({ctx,input})=>{
        return await ctx.db.meeting.delete({where:{id:input.meetingId}})
    }),
    getMeetingById:protectedProcedure.input(z.object({meetingId:z.string()})).query(async({ctx,input})=>{
        return await ctx.db.meeting.findUnique({
            where:{id:input.meetingId},
            include:{issues:true}
        })
    }),
    archiveProject:protectedProcedure.input(z.object({projectId:z.string()})).mutation(async({ctx,input})=>{
        return await ctx.db.project.update({
            where:{id:input.projectId},
            data:{deletedAt:new Date()}
        })
    }),
    getTeamMembers:protectedProcedure.input(z.object({projectId:z.string()})).query(async({ctx,input})=>{
        return await ctx.db.userToProject.findMany({
            where:{projectId:input.projectId},
            include:{user:true}
        })
    }),
    getMyCredits:protectedProcedure.query(async({ctx})=>{
        return ctx.db.user.findUnique({where:{id:ctx.user.userId!},select:{credits:true}})
    }),
    checkCredits:protectedProcedure.input(z.object({githubUrl:z.string(),githubToken:z.string().optional()})).mutation(async({input,ctx})=>{
        const fileCount=await checkCredits(input.githubUrl,input.githubToken)
        const userCredits=await ctx.db.user.findUnique({where:{id:ctx.user.userId!},select:{credits:true}})
        
        return {fileCount,userCredits:userCredits?.credits || 0}
    }),
})
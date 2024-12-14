import { z } from "zod"
import { createTRPCRouter,protectedProcedure,publicProcedure } from "../trpc"
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { arch } from "os";

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
})
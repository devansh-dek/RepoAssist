import { db } from "@/server/db";
import {Octokit} from "octokit";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

export const octokit=new Octokit({
    auth:process.env.GITHUB_TOKEN
});

const { data } = await octokit.rest.rateLimit.get();
console.log(data.resources.core);


// const githubUrl="https://github.com/PrathamDwivedi27/SmartDocs.ai"

type Response={
    commitHash:string;
    commitMessage:string;
    commitDate:string;
    commitAuthorName:string;
    commitAuthorAvatar:string;
}

export const getCommitHashes=async(githubUrl:string):Promise<any[]>=>{

    const [owner,repo]=githubUrl.split('/').slice(-2);

    if(!owner || !repo){
        throw new Error("Invalid github url");
    }
    
    const {data}=await octokit.rest.repos.listCommits({
        owner,
        repo
    })

    
    // console.log(data);
    // return data;

    const sortedCommits=data.sort((a:any,b:any)=> new Date(b.commit.author.date).getTime()-new Date(a.commit.author.date).getTime()) as any[];

    return sortedCommits.slice(0,15).map((commit:any)=>({
        commitHash:commit.sha as string,
        commitMessage:commit.commit.message ?? " ",
        commitAuthorName:commit.commit?.author?.name ?? "",
        commitDate:commit.commit?.author?.date ?? "",
        commitAuthorAvatar:commit?.author?.avatar_url ?? ""
    }))
}

// console.log(await getCommitHashes(githubUrl));

export const pollCommits=async(projectId:string)=>{
    const {project,githubUrl}=await fetchProjectGithubUrl(projectId);
    const commitHashes=await getCommitHashes(githubUrl);
    const unprocessedCommits=await filterUnprocessedCommits(projectId,commitHashes);
    // console.log(unprocessedCommits);

    const summaryResponses=await Promise.allSettled(unprocessedCommits.map(commit=>{
        return summariseCommit(githubUrl,commit.commitHash);

    }));

    const summaries=summaryResponses.map((response)=>{
        if(response.status==="fulfilled"){
            return response.value as string;
        }
        return "";
    })

    const commits =await db.commit.createMany({
        data: summaries.map((summary,index)=>{
            return {
                projectId:projectId,
                commitHash:unprocessedCommits[index]?.commitHash ?? "",
                commitMessage:unprocessedCommits[index]?.commitMessage ?? "",
                commitDate:unprocessedCommits[index]?.commitDate ?? "",
                commitAuthorName:unprocessedCommits[index]?.commitAuthorName ?? "",
                commitAuthorAvatar:unprocessedCommits[index]?.commitAuthorAvatar ?? "",
                summary
            }
        })
    })



    return commits;
}

async function summariseCommit(githubUrl:string, commitHash:string){
    //get the diff then pass to ai
    const {data}=await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
        headers:{
            Accept:"application/vnd.github.v3.diff"
        }
    });
    return await aiSummariseCommit(data) || "";
}

async function fetchProjectGithubUrl(projectId:string){
    const project=await db.project.findUnique({
        where:{
            id:projectId
        },
        select:{
            githubUrl:true
        }
    })
    if(!project?.githubUrl){
        throw new Error("Project not found or github url not set");
    }
    return {project,githubUrl:project.githubUrl};
}

async function filterUnprocessedCommits(projectId:string,commitHashes:Response[]){
    const processedCommits=await db.commit.findMany({
        where:{
            projectId
        }
    })
    const unprocessedCommitHashes=commitHashes.filter((commit)=>!processedCommits.some((processedCommit)=>processedCommit.commitHash===commit.commitHash));
    return unprocessedCommitHashes;
}

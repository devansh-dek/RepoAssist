import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";

export const loadingGithubRepo=async (githubUrl:string, githubToken?:string)=>{
    const loader = new GithubRepoLoader(
        githubUrl,
        {
          accessToken: githubToken || '',
          branch: "master",
          ignoreFiles:['package-lock.json','yarn.lock', 'pnpm-lock.yaml','bun.lockb'],
          recursive: true,
          unknown: "warn",
          maxConcurrency: 5, // Defaults to 2
        }
      );
      const docs = await loader.load();
      return docs;
}
// yha pehla step kiya to load github url and get documnets (documents means all files of that repo)

export const indexGithubRepo=async(projectId:string,githubUrl:string, githubToken?:string)=>{
    const docs=await loadingGithubRepo(githubUrl,githubToken);
    const allEmbeddings=await generateEmbeddings(docs);

    if (!allEmbeddings){
        console.log("all embeddings are null");
        return;
    }
    console.log("this is ",allEmbeddings)

    await Promise.allSettled(allEmbeddings.map(async (embedding,index)=>{
        console.log(`processing ${index} of ${allEmbeddings.length}`);
        if(!embedding) return ;

        const sourceCodeEmbedding=await db.sourceCodeEmbedding.create({
            data:{
                summary:embedding.summary!,
                sourceCode:embedding.sourceCode,
                fileName:embedding.fileName,
                projectId,
            }
        })
        //we cant pass the raw vector directly postgres don't support that so we have to write raw query
        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding"=${embedding.embedding}::vector
        WHERE "id"=${sourceCodeEmbedding.id}
        `
        
    }))
}

const  generateEmbeddings=async(docs:Document[])=>{
    return await Promise.all(docs.map(async doc=>{
        console.log(`Processing file: ${doc.metadata.source}`);
        const summary=await summariseCode(doc);
        if (!summary) {
            console.warn(`No summary generated for ${doc.metadata.source}`);
            return null;
        }
        const embedding= await generateEmbedding(summary!);
        console.log("embedding generated for",doc.metadata.source);
        if (!summary || !embedding) {
            console.warn(`Skipping embedding for file: ${doc.metadata.source}`);
            return null;
        }
        return {
            summary,
            embedding,
            sourceCode:JSON.parse(JSON.stringify(doc.pageContent)),
            fileName:doc.metadata.source
        }
    }))
    .then(results => results.filter(result => result !== null));
}

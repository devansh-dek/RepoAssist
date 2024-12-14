# RepoAssist: AI-Powered Codebase Management Tool

RepoAssist is an AI-driven platform that connects with your Git repositories, leveraging the capabilities of Gemini 1.5, Langchain, and RAG to provide real-time insights and interactions with your codebase. Whether you're working solo or collaborating with a team, RepoAssist makes managing, querying, and understanding your codebase easier and more efficient.

## 1. **🔗 GitHub Repository Integration**
Easily link your GitHub repository to RepoAssist. Once connected, you can ask AI-driven questions about your codebase. Whether it's understanding complex functions or tracking changes, Langchain and RAG provide accurate, contextual answers about your code.

![GitHub Integration](/images/Screenshot%202024-12-15%20011511.png)

## 2. **🧠 AI-Powered Question Answering**
Gain deep insights into your codebase with Langchain and Gemini 1.5. You can query specific parts of your code, understand logic, and ask complex questions, all with quick, clear responses. The system analyzes your code's context and offers relevant, actionable insights in real-time.

![AI Question Answering](/images/Screenshot%202024-12-15%20011734.png)  
![AI Question Answering](/images/Screenshot%202024-12-15%20011838.png)

## 3. **💬 Meeting Transcriptions & Summaries**
Upload audio files of your team meetings to Cloudinary and have them automatically transcribed with Assembly AI. The system generates accurate summaries of discussions, helping you stay on top of key takeaways, action items, and next steps, without having to sift through long audio files.

![Meeting Transcriptions](/images/Screenshot%202024-12-15%20013042.png)  
![Meeting Transcriptions](/images/Screenshot%202024-12-15%20013054.png)

## 4. **📜 Commit History Insights**
Review and summarize your last 15 commits with detailed notes, thanks to Gemini 1.5. Understand what was changed, why, and how it fits into your project without diving deep into the code manually. Cloudinary provides secure storage for any related media files, offering a comprehensive view of your project history.

![Commit History](/images/Screenshot%202024-12-15%20011712.png)

## 5. **💳 Credit-Based System & Stripe Integration**
Start with free credits and easily purchase additional credits via Stripe when you run out. Premium features like unlimited queries, document uploads, and meeting transcriptions are available with a one-time or recurring payment, ensuring a seamless experience.

![Stripe Integration](/images/Screenshot%202024-12-15%20013112.png)  
![Stripe Integration](/images/Screenshot%202024-12-15%20013124.png)

## 6. **📂 Manage and Save Code Insights**
Save answers to your questions or meeting summaries for later reference. Although the system primarily processes real-time queries, it can also save valuable insights and summaries for future use, helping you track decisions and ideas over time.

![Save Code Insights](/images/Screenshot%202024-12-15%20013202.png)  
![Stripe Integration](/images/Screenshot%202024-12-15%20011838.png)

## 7. **⚡ Fast, Seamless Performance**
Built with Next.js and TRPC Protocol, RepoAssist offers a highly responsive and fast experience. Whether you're interacting with your repository or uploading audio files for transcriptions, expect swift processing times and a smooth user experience.

![Fast Performance](/images/Screenshot%202024-12-15%20011907.png)

## 8. **🌍 Scalable Cloud Storage**
With Cloudinary as the media storage provider, RepoAssist ensures secure storage for your audio files, commit history media, and other important documents. The cloud-based solution offers scalable and reliable storage that can handle large amounts of data.

## Tech Stack

- **Frontend:** Next.js  
- **Backend:** TRPC Protocol  
- **AI & Embedding:** Langchain, Gemini 1.5, RAG  
- **Database:** PostgreSQL, Neon DB  
- **Cloud Storage:** Cloudinary (for audio file storage)  
- **Authentication:** NextAuth.js  
- **Payment Integration:** Stripe

## How It Works

RepoAssist seamlessly integrates with your GitHub repository to allow you to interact with your codebase using advanced AI models. By linking your repository, you can query your codebase, see your last 15 commits with summarized insights, and use speech-to-text AI to transcribe meetings and generate summaries.

### 1. **Load GitHub Repo Files using Langchain**
The repo files are treated as documents in Langchain.

![LoadingToLangchain](/images/Screenshot%202024-12-15%20014448.png)

### 2. **Use Gemini API to Summarize the Contents of Each Document**
Use `getSummary(document.pageContent)` for example, `bankers-algo.c`.  
This reduces the load on Gemini and ensures better embeddings.

Output:  
*This C code implements the Banker's Algorithm, a deadlock avoidance algorithm. It simulates resource allocation among five processes (P0-P4) using three resource types. The algorithm checks if a safe sequence exists, meaning all processes can finish without deadlock. It uses allocation, maximum, and available resource matrices to determine if a safe sequence exists and prints the sequence if one is found; otherwise, it indicates that the system is unsafe (a deadlock could occur).*

### 3. **Vector Embed Each Summary and Store It in Vector Store**
Use `getEmbeddings(document.summary)` to generate vector embeddings like:  
`[0.345, 1.445, 0.455, 2.578]`

![LoadingToLangchain](/images/Screenshot%202024-12-15%20014519.png)

### 4. **Querying Data and Asking Questions**
Use `getEmbeddings(document.summary)` --> `queryVector`.  
The more similar the query vector is to different lines, the more similar they are. For example, `queryVector` and `service.ts` match the query, while `index.ts` doesn't match at all, showing they are at opposite directions.

![LoadingToLangchain](/images/Screenshot%202024-12-15%20014532.png)

### 5. **Retrieval Augmented Generation**

![LoadingToLangchain](/images/Screenshot%202024-12-15%20014553.png)

### 6. **Audio File Storage on Cloudinary and Text Conversion by AssemblyAI: Issues and Key Topics**
  a. The files are first uploaded to Cloudinary, which in return provides you with a URL.  
  b. Then, we create a meeting based on its defined schema.  
  c. After processing, the status is updated, and any issues generated for summaries are recorded.

![LoadingToLangchain](/images/Screenshot%202024-12-15%20014606.png)

import { db } from '@/server/db';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
    params:Promise<{projectId:string}>
}

const JoinHandler = async(props: Props) => {
    const {projectId}= await props.params;

    const {userId}=await auth();

    if(!userId) return redirect("/sign-in");
    const dbUser=await db.user.findUnique({
        where:{
            id:userId
        }
    })
    const client=await clerkClient();
    const user=await client.users.getUser(userId);
    if(!dbUser){
        await db.user.create({
            data:{
                id:userId,
                emailAddress:user.emailAddresses[0]!.emailAddress,
                firstName:user.firstName,
                lastName:user.lastName,
                imageUrl:user.imageUrl
            }
        })
    }
    const project=await db.project.findUnique({
        where:{
            id:projectId
        }
    })
    if(!project) return redirect("/dashboard");

    try {
        await db.userToProject.create({
            data:{
                projectId:projectId,
                userId:userId
            }
        })
        toast.success("Joined project successfully");
    } catch (error) {        
        console.log('user already joined');
        // window.alert('You have already joined this project');
        redirect(`/dashboard`);
    }
    return redirect(`/dashboard/${projectId}`);
 
}

export default JoinHandler
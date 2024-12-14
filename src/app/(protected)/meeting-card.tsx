"use client"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadFile } from '@/lib/cloudinary'
import { Presentation, UploadIcon } from 'lucide-react'
import React from 'react'
import { useDropzone } from 'react-dropzone'
import {CircularProgressbar,buildStyles} from 'react-circular-progressbar'
import { toast } from 'sonner'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const MeetingCard = () => {
    const {project}=useProject();
    const processMeeting=useMutation({
        mutationFn: async ({ meetingUrl, meetingId, projectId }: { meetingUrl: string, meetingId: string, projectId: string }) => {
            const reponse=await axios.post('/api/process-meeting',{meetingId,meetingUrl,projectId});
            return reponse.data;
        }
    })


    const [isUploading, setIsUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const router=useRouter();
    const uploadingMeeting=api.project.uploadMeeting.useMutation();
    

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async (acceptedFiles) => {
            if(!project) return ;
            setIsUploading(true);
            try {
                const file = acceptedFiles[0];
                if (!file) return ;
                    // console.log("Uploading file:", file.name);
                    const downloadURL=await uploadFile(file as File, setProgress) as string;
                    // console.log("File uploaded to Cloudinary:", downloadURL);
                    uploadingMeeting.mutate({
                        projectId:project.id,
                        meetingUrl:downloadURL,
                        name:file.name
                    },{
                        onSuccess:(meeting)=>{
                            toast.success("File uploaded successfully");
                            router.push('/meetings');
                            processMeeting.mutateAsync({meetingUrl:downloadURL,meetingId:meeting.id,projectId:project.id});
                        }
                    })
                

            } catch (error) {
                console.error("Upload error:", error);
            } finally {
                setIsUploading(false);
            }
        },
    });

    return (
        <Card className="col-span-2 flex flex-col items-center justify-center p-10" {...getRootProps()}>
            {!isUploading && (
                <>
                    <Presentation className="h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        Create a new meeting
                    </h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analyse your meeting with RepoAssist.
                        <br />
                        Powered by AI
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading}>
                            <UploadIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Upload Meeting
                            <input className="hidden" {...getInputProps()} />
                        </Button>
                    </div>
                </>
            )}
            {isUploading && (
                <div className='flex flex-col items-center'>
                    <CircularProgressbar
                        value={progress}
                        text={`${progress}%`}
                        styles={buildStyles({
                            pathColor: "#2563eb", // Blue color for the progress
                            textColor: "#2563eb", // Blue color for the text
                        })}
                        className="size-20"
                    />
                    <p className="mt-4 text-sm text-gray-500 text-center">
                        Uploading your meeting...
                    </p>
                </div>
            )}
        </Card>
    );
};

export default MeetingCard;



 
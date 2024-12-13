"use client"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadFile } from '@/lib/cloudinary'
import { Presentation, UploadIcon } from 'lucide-react'
import React from 'react'
import { useDropzone } from 'react-dropzone'
import {CircularProgressbar,buildStyles} from 'react-circular-progressbar'
import { toast } from 'sonner'

const MeetingCard = () => {
    const [isUploading, setIsUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async (acceptedFiles) => {
            setIsUploading(true);
            try {
                const file = acceptedFiles[0];
                if (file) {
                    console.log("Uploading file:", file.name);
                    const downloadURL=await uploadFile(file as File, setProgress);
                    console.log("File uploaded to Cloudinary:", downloadURL);
                }

                toast.success("File uploaded successfully");
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



 
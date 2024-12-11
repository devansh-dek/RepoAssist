"use client"
import MDEditor from '@uiw/react-md-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useProject from '@/hooks/use-project';
import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { askQuestion } from './actions';
import { readStreamableValue } from 'ai/rsc';
import CodeReferences from './code-references';

const AskQuestionCard = () => {
    const {project}=useProject();
    const [open,setOpen]=useState(false);
    const [loading,setLoading]=useState(false);
    const [question,setQuestion]=useState('');
    const [filesReferences,setFilesReferences]=useState<{fileName:string,sourceCode:string,summary:string}[]>([]);
    const [answer ,setAnswer]=useState('');

    const onSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
        setAnswer('');
        setFilesReferences([]);
        e.preventDefault();
        // window.alert('Question submitted');
        if(!project?.id) return ;
        setLoading(true);
        setOpen(true);

        const {output,filesReferences}=await askQuestion(question,project.id);
        setFilesReferences(filesReferences);

        for await (const delta of readStreamableValue(output)){ 
            if(delta){
                setAnswer(ans=>ans+delta);
            }
        }
        setLoading(false);
    }

  return (
    <>
     <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[80vw] max-h-[80vh] overflow-auto'>
            <DialogHeader>
                <DialogTitle className='flex'>
                    <Image src='/logo.svg' alt='RepoAssist' width={60} height={50}/>
                    <p className='mt-4 text-2xl text-blue-500'>RepoAssist</p>
                </DialogTitle>
            </DialogHeader>
            <MDEditor.Markdown source={answer} className='custom-markdown max-w-[90vw] h-full max-h-[60vh] overflow-scroll'/>
            <div className='h-4'></div>
            <CodeReferences filesReferences={filesReferences}/>
            <Button type='button' onClick={()=>{setOpen(false)}}>
                Close
            </Button>
            
        </DialogContent>
     </Dialog>
     <Card className='relative col-span-3'>
        <CardHeader>
            <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={onSubmit}>
                <Textarea placeholder="Which file should I edit to change the home page?" onChange={e=>setQuestion(e.target.value)}/>
                <div className='h-4'></div>
                <Button type='submit' disabled={loading}>
                    Ask RepoAssist
                </Button>
            </form>
        </CardContent>
        
     </Card> 
    </>
  )
}

export default AskQuestionCard

"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useProject from '@/hooks/use-project';
import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';

const AskQuestionCard = () => {
    const {project}=useProject();
    const [open,setOpen]=useState(false);
    const [question,setQuestion]=useState('');

    const onSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        // window.alert('Question submitted');
        setOpen(true);
    }

  return (
    <>
     <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    <Image src='/logo.svg' alt='RepoAssist' width={40} height={40}/>
                </DialogTitle>
            </DialogHeader>
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
                <Button type='submit'>
                    Ask RepoAssist
                </Button>
            </form>
        </CardContent>
        
     </Card> 
    </>
  )
}

export default AskQuestionCard

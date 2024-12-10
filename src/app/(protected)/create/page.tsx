"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';
import React from 'react'
import { useForm } from 'react-hook-form';
import {toast} from 'sonner'

type FormInput= {
  repoUrl:string,
  projectName:string,
  githubToken?:string
}

const CreatePage = () => {
  const {register, handleSubmit,reset}=useForm<FormInput>();
  const createProject =api.project.createProject.useMutation();

  function onSubmit(data:FormInput){
      // window.alert(JSON.stringify(data));
      createProject.mutate({
        githubUrl:data.repoUrl,
        name:data.projectName,
        githubToken:data.githubToken
      },{
        onSuccess:()=>{
          toast.success('Linked Project successfully');
          reset();
        },
        onError:(error)=>{
          toast.error("Failed to link project");
        }
      })
      console.log(data);
  }
  return (
    <div className='flex items-center gap-12 h-full justify-start px-8'>
      <img src='/undraw_github.svg' className='h-56 w-auto mr-8'/>
      <div >
        <div>
          <h1 className='font-semibold text-2xl'>
             Link your Github repository
          </h1>
          <p className='text-sm text-muted-foreground'>
              Enter the url of your repository to link to RepoAssist
          </p>
        </div>
        <div className='h-4'></div>
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                  {...register('projectName',{required:true})}
                  placeholder='Project Name'
                  required
                />
                <div className='h-2'></div>
                <Input
                  {...register('repoUrl',{required:true})}
                  placeholder='Github Repository URL'
                  type='url'
                  required
                />
                <div className='h-2'></div>
                <Input
                  {...register('githubToken')}
                  placeholder='Github Token (Optional) for private repos'
                
                />
                <div className='h-4'></div>
                <Button type='submit' disabled={createProject.isPending}>
                  Link Repository
                </Button>
            </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePage

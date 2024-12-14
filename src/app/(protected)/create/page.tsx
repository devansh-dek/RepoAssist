"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react';
import { Info } from 'lucide-react';
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
  const checkCredits=api.project.checkCredits.useMutation();

  const refetch=useRefetch();

  function onSubmit(data:FormInput){
      if(!!checkCredits.data){
                // window.alert(JSON.stringify(data));

      
      createProject.mutate({
        githubUrl:data.repoUrl,
        name:data.projectName,
        githubToken:data.githubToken
      },{
        onSuccess:()=>{
          toast.success('Linked Project successfully');
          refetch();
          reset();
        },
        onError:(error)=>{
          toast.error("Failed to link project");
        }
      })
      console.log(data);
      }
      else{
        checkCredits.mutate({
          githubUrl:data.repoUrl,
          githubToken:data.githubToken
        })
      }
  }

  const hasEnoughCredits=checkCredits?.data?.userCredits && checkCredits.data.fileCount !== undefined ? checkCredits.data.fileCount <= checkCredits.data.userCredits : true;
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
                {!!checkCredits.data && (
                  <>
                    <div className='mt-2 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700'>
                      <div className='flex items-center gap-2'>
                        <Info className='size-4'/>
                        <p className='text-sm'>You will be charged <strong>{checkCredits.data?.fileCount}</strong>credits for this repo</p>
                      </div>
                      <p className='text-sm text-blue-600 ml-6 '>You have <strong>{checkCredits.data?.userCredits}</strong>credits remaining</p>
                    </div>
                  </>
                ) }
                <Button type='submit' disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits} className='mt-2'>
                  {!!checkCredits.data ? 'Link Repository' : 'Check Credits'}
                  {/* Link Repository */}
                </Button>
            </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePage

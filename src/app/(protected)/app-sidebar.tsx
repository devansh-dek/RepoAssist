"use client"

import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { BotIcon, CreditCardIcon, LayoutDashboardIcon, PresentationIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items=[
    {
        title:"Dashboard",
        icon:LayoutDashboardIcon,
        url:"/dashboard"
    },
    {
        title:"Q&A",
        url:"/qa",
        icon:BotIcon
    },
    {
        title:"Meetings",
        url:"/meetings",
        icon:PresentationIcon
    },
    {
        title:"Billing",
        url:"/billing",
        icon:CreditCardIcon
    }
];

const projects=[
    {
        title:"Project 1",
    },
    {
        title:"Project 2",
    },
];

export function AppSidebar(){
    const pathName=usePathname();
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                Logo
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {items.map(item=>{
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className={cn({
                                            'bg-primary text-white':pathName===item.url
                                        })}>
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                        </SidebarMenu> 
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarContent>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects.map(project=>{
                                return (
                                    <SidebarMenuItem key={project.title}>
                                        <SidebarMenuButton asChild>
                                            <div>
                                                <div className={cn(
                                                    "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary" ,
                                                    {
                                                        "bg-primary text-white":true
                                                    }
                                                )}>
                                                    {project.title[0]}
                                                </div>
                                                <span>{project.title}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            <div className="h-2"></div>
                            <SidebarMenuItem>
                                <Link href='/create'>
                                    <Button variant={'outline'} className="w-fit" size="sm">
                                        Create Project
                                    </Button>
                                </Link>
                            
                            </SidebarMenuItem>
                            
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarContent>
            </SidebarContent>

        </Sidebar>
    )
}
import { BookOpen, Brain, Download, GitBranch, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import Link from "next/link";
import React from "react";
import { createPageUrl } from "@/utils";
import { useRouter } from "next/router";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Dialogue Editor",
    url: createPageUrl("DialogueEditor"),
    icon: GitBranch,
  },
  {
    title: "Codex",
    url: createPageUrl("Codex"),
    icon: BookOpen,
  },
  {
    title: "Export",
    url: createPageUrl("Export"),
    icon: Download,
  },
];

export default function Layout({ children, currentPageName }) {
  const router = useRouter();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-950">
        <Sidebar className="border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center glow">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white">NarrativeAI</h2>
                <p className="text-xs text-slate-400">Dialogue & Story Engine</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 py-2">
                Workflow
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-300 rounded-lg mb-1 ${
                          router.pathname === item.url ? 'bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-500' : 'text-slate-300'
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">G</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">Game Developer</p>
                <p className="text-xs text-slate-400 truncate">Build amazing stories</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-800 p-2 rounded-lg transition-colors duration-200 text-slate-300" />
              <h1 className="text-xl font-semibold text-white">NarrativeAI</h1>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
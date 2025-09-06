import { BookOpen, Brain, Download, GitBranch, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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

import React from "react";
import { createPageUrl } from "@/utils";

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
  const location = useLocation();

  return (
    <SidebarProvider>
      <style jsx>{`
        :root {
          --background: 8 8 16;
          --foreground: 248 250 252;
          --card: 15 23 42;
          --card-foreground: 248 250 252;
          --popover: 15 23 42;
          --popover-foreground: 248 250 252;
          --primary: 99 102 241;
          --primary-foreground: 248 250 252;
          --secondary: 30 41 59;
          --secondary-foreground: 203 213 225;
          --muted: 30 41 59;
          --muted-foreground: 148 163 184;
          --accent: 67 56 202;
          --accent-foreground: 241 245 249;
          --destructive: 239 68 68;
          --destructive-foreground: 248 250 252;
          --border: 30 41 59;
          --input: 30 41 59;
          --ring: 99 102 241;
        }
        
        * {
          border-color: hsl(var(--border));
        }
        
        body {
          color: hsl(var(--foreground));
          background: linear-gradient(135deg, rgb(8, 8, 16) 0%, rgb(15, 23, 42) 50%, rgb(8, 8, 16) 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .glass-effect {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .glow {
          box-shadow: 0 0 24px rgba(99, 102, 241, 0.4);
        }
        
        .node-editor {
          background: 
            radial-gradient(circle at 25px 25px, rgba(99, 102, 241, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 75px 75px, rgba(67, 56, 202, 0.1) 2px, transparent 2px);
          background-size: 100px 100px;
        }
      `}</style>
      
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
                          location.pathname === item.url ? 'bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-500' : 'text-slate-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
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

import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User, Search, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-slate-600 hover:bg-white/20" />
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h2 className="font-medium text-slate-700 hidden sm:block">Observatório da Consciência</h2>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Buscar insights..." 
            className="pl-10 w-64 bg-white/20 border-white/30 text-slate-700 placeholder:text-slate-500"
          />
        </div>
        <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-white/20">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-white/20">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}


import React, { useState, useEffect } from 'react';
import { SidebarNavItem } from '@/components/SidebarNavItem';
import { SidebarMenu } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from 'lucide-react';

export function DynamicAreasDisplay() {
  const [customAreas, setCustomAreas] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchCustomAreas = async () => {
      const { data, error } = await supabase
        .from("custom_areas")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setCustomAreas(data);
      }
    };

    fetchCustomAreas();
  }, [user?.id]);

  if (customAreas.length === 0) return null;

  // Converter áreas personalizadas em itens de menu
  const customAreaItems = customAreas.map(area => ({
    title: area.area_name,
    icon: Sparkles,
    url: `/dashboard/custom-area/${area.id}`
  }));

  return (
    <SidebarMenu className="space-y-1">
      {customAreaItems.map((item) => (
        <SidebarNavItem key={item.url} {...item} />
      ))}
    </SidebarMenu>
  );
}

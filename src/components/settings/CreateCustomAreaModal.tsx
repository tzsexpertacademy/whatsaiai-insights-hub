
import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type CustomAreaForm = {
  area_name: string;
  focus: string;
  objective: string;
  assistant_name: string;
  assistant_persona: string;
  assistant_tone: string;
};

export function CreateCustomAreaModal({ onAreaCreated }: { onAreaCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm<CustomAreaForm>();

  // Função para criar nova área
  const onSubmit = async (data: CustomAreaForm) => {
    if (!user?.id) return;
    setLoading(true);
    const { error } = await supabase
      .from('custom_areas')
      .insert({
        ...data,
        user_id: user.id,
      });
    setLoading(false);
    if (!error) {
      setOpen(false);
      reset();
      onAreaCreated?.();
    } else {
      alert('Erro ao criar área personalizada: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full sm:w-auto">
          + Nova Área Personalizada
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogTitle>Criar Nova Área Personalizada</DialogTitle>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm mb-1 font-medium" htmlFor="area_name">Nome da Área</label>
            <Input {...register("area_name", { required: true })} id="area_name" placeholder="Ex: Espiritualidade" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium" htmlFor="focus">Foco / Domínio</label>
            <Input {...register("focus")} id="focus" placeholder="Ex: Práticas espirituais, reflexão etc" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium" htmlFor="objective">Objetivo</label>
            <Textarea {...register("objective")} id="objective" placeholder="Descreva o objetivo da área" />
          </div>
          <hr />
          <div>
            <label className="block text-xs mb-1 font-bold uppercase text-gray-600">Configuração do Assistente</label>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1 font-medium" htmlFor="assistant_name">Nome do Assistente</label>
                <Input {...register("assistant_name", { required: true })} id="assistant_name" placeholder="Ex: Guardião do Espírito" />
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium" htmlFor="assistant_persona">Persona do Assistente</label>
                <Input {...register("assistant_persona")} id="assistant_persona" placeholder="Ex: Mentor, provocador, empático..." />
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium" htmlFor="assistant_tone">Tom de Voz</label>
                <Input {...register("assistant_tone")} id="assistant_tone" placeholder="Ex: Inspirador, pragmático, meditativo..." />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Criar Área"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

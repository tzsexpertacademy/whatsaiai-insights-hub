
import { Target, TrendingUp, Users, Cog, DollarSign, Zap, Rocket } from 'lucide-react';
import React from 'react';

export const getAreaIcon = (area?: string) => {
  switch (area) {
    case 'estrategia': return React.createElement(Target, { className: "h-4 w-4" });
    case 'gestao': return React.createElement(Users, { className: "h-4 w-4" });
    case 'performance': return React.createElement(TrendingUp, { className: "h-4 w-4" });
    case 'processos': return React.createElement(Cog, { className: "h-4 w-4" });
    case 'vendas': return React.createElement(DollarSign, { className: "h-4 w-4" });
    case 'prospeccao': return React.createElement(Zap, { className: "h-4 w-4" });
    case 'expansao': return React.createElement(Rocket, { className: "h-4 w-4" });
    default: return React.createElement(DollarSign, { className: "h-4 w-4" });
  }
};

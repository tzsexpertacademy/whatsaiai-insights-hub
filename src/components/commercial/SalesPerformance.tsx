
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockSalesData = [
  { name: 'João Silva', role: 'Closer', closed: 23, revenue: 345000, conversion: 85, meetings: 45 },
  { name: 'Maria Santos', role: 'SDR', closed: 0, revenue: 0, conversion: 92, meetings: 67 },
  { name: 'Pedro Costa', role: 'Closer', closed: 18, revenue: 278000, conversion: 78, meetings: 38 },
  { name: 'Ana Ferreira', role: 'SDR', closed: 0, revenue: 0, conversion: 88, meetings: 54 }
];

export function SalesPerformance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Performance de Vendas</h1>
          <p className="text-slate-600">Análise individual e coletiva da equipe</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Individual da Equipe</CardTitle>
          <CardDescription>Métricas detalhadas por vendedor</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Fechamentos</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Taxa Conversão</TableHead>
                <TableHead>Reuniões</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSalesData.map((seller) => (
                <TableRow key={seller.name}>
                  <TableCell className="font-medium">{seller.name}</TableCell>
                  <TableCell>
                    <Badge variant={seller.role === 'Closer' ? 'default' : 'secondary'}>
                      {seller.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{seller.closed}</TableCell>
                  <TableCell>
                    {seller.revenue > 0 ? `R$ ${seller.revenue.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={seller.conversion >= 85 ? 'default' : seller.conversion >= 75 ? 'secondary' : 'destructive'}>
                      {seller.conversion}%
                    </Badge>
                  </TableCell>
                  <TableCell>{seller.meetings}</TableCell>
                  <TableCell>
                    <Badge variant={seller.conversion >= 85 ? 'default' : 'secondary'}>
                      {seller.conversion >= 85 ? 'Acima da Meta' : 'Na Meta'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

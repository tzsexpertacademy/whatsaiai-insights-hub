
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileIcon,
  Download,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { parseDocument, type ParsedDocument } from '@/utils/documentParser';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface UploadedDocument extends ParsedDocument {
  id: string;
  uploadDate: Date;
}

export function DocumentAnalysis() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { config } = useClientConfig();

  // Verificar se OpenAI está configurada
  const isOpenAIConfigured = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        console.log(`📄 Processando arquivo: ${file.name}`);
        
        try {
          const parsedDoc = await parseDocument(file);
          
          const uploadedDoc: UploadedDocument = {
            ...parsedDoc,
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            uploadDate: new Date()
          };

          setDocuments(prev => [...prev, uploadedDoc]);
          
          toast({
            title: "✅ Documento processado",
            description: `${file.name} foi analisado com sucesso`,
          });

        } catch (error) {
          console.error(`❌ Erro ao processar ${file.name}:`, error);
          toast({
            title: "❌ Erro no processamento",
            description: `Falha ao processar ${file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
    toast({
      title: "🗑️ Documento removido",
      description: "Documento foi removido da análise",
    });
  };

  const exportDocuments = () => {
    const exportData = documents.map(doc => ({
      fileName: doc.metadata.fileName,
      fileType: doc.metadata.fileType,
      fileSize: doc.metadata.fileSize,
      pageCount: doc.metadata.pageCount,
      uploadDate: doc.uploadDate,
      textPreview: doc.text.substring(0, 500) + '...'
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentos_analisados_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📊 Exportação concluída",
      description: "Dados dos documentos foram exportados",
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Análise de Documentos</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Faça upload e analise documentos em diversos formatos para extrair insights valiosos
        </p>
      </div>

      {/* Status da Conexão OpenAI */}
      {!isOpenAIConfigured ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>❌ OpenAI não configurada:</strong> Configure sua API key da OpenAI em Configurações para análises com IA.
            <Button variant="link" className="ml-2 p-0 h-auto text-red-600" onClick={() => window.location.href = '/dashboard/settings'}>
              Ir para Configurações
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ OpenAI configurada:</strong> Análise com IA ativa e funcionando!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="documents">Documentos ({documents.length})</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="document-upload" className="cursor-pointer">
                    <Button asChild disabled={isUploading}>
                      <span>
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Selecionar Arquivos
                          </>
                        )}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="document-upload"
                    type="file"
                    multiple
                    accept=".txt,.pdf,.md,.json,.csv,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                  <p className="text-sm text-gray-600">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos suportados: TXT, PDF, MD, JSON, CSV, DOC, DOCX
                  </p>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Processando documentos... Por favor, aguarde.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          {/* Documents List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos Processados
              </CardTitle>
              {documents.length > 0 && (
                <div className="flex gap-2">
                  <Button onClick={exportDocuments} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum documento processado ainda</p>
                  <p className="text-sm text-gray-400">Faça upload de documentos na aba Upload</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {doc.metadata.fileName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{(doc.metadata.fileSize / 1024).toFixed(1)} KB</span>
                            {doc.metadata.pageCount && (
                              <span>{doc.metadata.pageCount} página(s)</span>
                            )}
                            <span>{doc.uploadDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {doc.metadata.fileType.split('/')[1]?.toUpperCase() || 'DOC'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => setSelectedDocument(doc)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeDocument(doc.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Viewer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visualizador de Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDocument ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {selectedDocument.metadata.fileName}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <Badge variant="outline">
                          {(selectedDocument.metadata.fileSize / 1024).toFixed(1)} KB
                        </Badge>
                        {selectedDocument.metadata.pageCount && (
                          <Badge variant="outline">
                            {selectedDocument.metadata.pageCount} página(s)
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {selectedDocument.uploadDate.toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4 bg-white border rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                        {selectedDocument.text}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Selecione um documento para visualizar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Análise do Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDocument ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Caracteres</p>
                        <p className="text-xl font-bold text-blue-900">
                          {selectedDocument.text.length.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Palavras</p>
                        <p className="text-xl font-bold text-green-900">
                          {selectedDocument.text.split(/\s+/).length.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Linhas</p>
                        <p className="text-xl font-bold text-purple-900">
                          {selectedDocument.text.split('\n').length.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">Tamanho</p>
                        <p className="text-xl font-bold text-orange-900">
                          {(selectedDocument.metadata.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    {isOpenAIConfigured && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>✅ Análise avançada disponível:</strong> Use o botão "Atualizar Relatórios com IA" para análise completa.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Selecione um documento para análise</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

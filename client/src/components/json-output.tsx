import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Conversion } from "@shared/schema";

interface JSONOutputProps {
  conversionId: string;
}

export default function JSONOutput({ conversionId }: JSONOutputProps) {
  const [isFormatted, setIsFormatted] = useState(true);
  const { toast } = useToast();

  const { data: conversion, isLoading } = useQuery<Conversion>({
    queryKey: ["/api/conversions", conversionId],
    enabled: !!conversionId,
  });

  const handleCopy = async () => {
    if (!conversion?.jsonData) return;

    try {
      const jsonText = isFormatted 
        ? JSON.stringify(conversion.jsonData, null, 2)
        : JSON.stringify(conversion.jsonData);
      
      await navigator.clipboard.writeText(jsonText);
      toast({
        title: "Copied to clipboard",
        description: "JSON data has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy JSON data to clipboard.",
        variant: "destructive",
      });
    }
  };

  const toggleFormatting = () => {
    setIsFormatted(!isFormatted);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const highlightJSON = (json: string) => {
    return json
      .replace(/(".*?")(\s*:\s*)(".*?")/g, '<span class="json-key">$1</span>$2<span class="json-string">$3</span>')
      .replace(/(".*?")(\s*:\s*)(\d+)/g, '<span class="json-key">$1</span>$2<span class="json-number">$3</span>')
      .replace(/(".*?")(\s*:\s*)(true|false)/g, '<span class="json-key">$1</span>$2<span class="json-boolean">$3</span>')
      .replace(/^(\s*)(".*?")(\s*:\s*)/gm, '$1<span class="json-key">$2</span>$3');
  };

  if (isLoading || !conversion) {
    return (
      <div className="fade-in">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-6xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground">Loading JSON output...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!conversion.jsonData) {
    return null;
  }

  const jsonString = isFormatted 
    ? JSON.stringify(conversion.jsonData, null, 2)
    : JSON.stringify(conversion.jsonData);

  const jsonSize = new Blob([jsonString]).size;
  const stats = (conversion.jsonData as any)?.statistics || {};

  return (
    <div className="fade-in" id="json-output">
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-sans text-card-foreground">JSON Output</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                data-testid="copy-button"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFormatting}
                data-testid="format-button"
              >
                <i className="fas fa-code mr-2"></i>
                {isFormatted ? 'Minify' : 'Format'}
              </Button>
            </div>
          </div>

          {/* JSON Viewer */}
          <div className="json-viewer bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
            <pre className="text-card-foreground" data-testid="json-output">
              <code 
                dangerouslySetInnerHTML={{ 
                  __html: highlightJSON(jsonString) 
                }}
              />
            </pre>
          </div>

          {/* Output Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-card-foreground" data-testid="stat-pages">
                {stats.totalPages || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Pages</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-card-foreground" data-testid="stat-words">
                {stats.totalWords || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Words</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-card-foreground" data-testid="stat-fields">
                {(conversion.jsonData as any)?.formFields?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Form Fields</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-card-foreground" data-testid="stat-size">
                {formatFileSize(jsonSize)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">JSON Size</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

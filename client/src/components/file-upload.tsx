import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onConversionStart: (conversionId: string) => void;
}

export default function FileUpload({ onConversionStart }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("pdf", file);
      
      const response = await apiRequest("POST", "/api/conversions", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: "Your PDF is now being converted to JSON.",
      });
      onConversionStart(data.id);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 1000 * 1024 * 1024, // 1000MB
    multiple: false,
  });

  const handleFileSelect = (file: File) => {
    if (file.size > 1000 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size exceeds maximum limit of 1000 MB. Selected file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleConvert = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="bg-card border border-border shadow-sm fade-in">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold font-sans mb-4 text-card-foreground">Upload PDF File</h2>
        
        {/* Drag and Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
            isDragActive 
              ? 'border-primary bg-accent' 
              : 'border-border hover:border-primary'
          }`}
          data-testid="drop-zone"
        >
          <input {...getInputProps()} data-testid="file-input" />
          <div className="mb-4">
            <i className="fas fa-cloud-upload-alt text-6xl text-muted-foreground"></i>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            {isDragActive ? "Drop PDF here" : "Drag & Drop PDF Here"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-testid="browse-button"
          >
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground mt-4">Maximum file size: 1000 MB</p>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="mt-6" data-testid="file-info">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-file-pdf text-destructive text-2xl"></i>
                  <div>
                    <p className="font-semibold text-card-foreground" data-testid="file-name">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid="file-size">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive/80"
                  data-testid="remove-file"
                >
                  <i className="fas fa-times text-xl"></i>
                </Button>
              </div>
              <Button
                onClick={handleConvert}
                disabled={uploadMutation.isPending}
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
                data-testid="convert-button"
              >
                {uploadMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-exchange-alt mr-2"></i>
                    Convert to JSON
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Conversion } from "@shared/schema";

interface ConversionStatusProps {
  conversionId: string | null;
  onConversionComplete: () => void;
}

export default function ConversionStatus({ conversionId, onConversionComplete }: ConversionStatusProps) {
  const { data: conversion, isLoading } = useQuery<Conversion>({
    queryKey: ["/api/conversions", conversionId],
    enabled: !!conversionId,
    refetchInterval: conversionId ? 1000 : false, // Poll every second when active
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (conversion?.status === "completed") {
      onConversionComplete();
    }
  }, [conversion?.status, onConversionComplete]);

  const getStepState = (step: string) => {
    if (!conversion) return "pending";
    
    switch (step) {
      case "validation":
        return conversion.progress >= 10 ? "completed" : "pending";
      case "extraction":
        return conversion.progress >= 60 ? "completed" : conversion.progress >= 10 ? "active" : "pending";
      case "generation":
        return conversion.progress >= 100 ? "completed" : conversion.progress >= 60 ? "active" : "pending";
      default:
        return "pending";
    }
  };

  const StepIcon = ({ state }: { state: string }) => {
    switch (state) {
      case "completed":
        return <i className="fas fa-check text-sm"></i>;
      case "active":
        return <i className="fas fa-spinner fa-spin text-sm"></i>;
      default:
        return <i className="fas fa-clock text-sm"></i>;
    }
  };

  const getStepBgColor = (state: string) => {
    switch (state) {
      case "completed":
        return "bg-chart-2 text-white";
      case "active":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!conversionId) {
    return (
      <Card className="bg-card border border-border shadow-sm fade-in">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold font-sans mb-4 text-card-foreground">Conversion Status</h2>
          <div className="text-center py-12" data-testid="idle-state">
            <i className="fas fa-hourglass-start text-6xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No conversion in progress</p>
            <p className="text-sm text-muted-foreground mt-2">Upload a PDF file to begin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !conversion) {
    return (
      <Card className="bg-card border border-border shadow-sm fade-in">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold font-sans mb-4 text-card-foreground">Conversion Status</h2>
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-6xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border shadow-sm fade-in">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold font-sans mb-4 text-card-foreground">Conversion Status</h2>
        
        {conversion.status === "failed" ? (
          <div className="text-center py-8" data-testid="error-state">
            <div className="bg-destructive/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-4xl text-destructive"></i>
            </div>
            <h3 className="text-lg font-bold text-card-foreground mb-2">Conversion Failed</h3>
            <p className="text-sm text-muted-foreground mb-6" data-testid="error-message">
              {conversion.errorMessage || "The PDF file appears to be corrupted or invalid"}
            </p>
            <Button 
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-testid="retry-button"
            >
              <i className="fas fa-redo mr-2"></i>
              Try Again
            </Button>
          </div>
        ) : conversion.status === "completed" ? (
          <div className="text-center py-8" data-testid="success-state">
            <div className="bg-chart-2/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check-circle text-4xl text-chart-2"></i>
            </div>
            <h3 className="text-lg font-bold text-card-foreground mb-2">Conversion Successful!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your PDF has been converted to JSON format</p>
            <div className="flex gap-3 justify-center">
              <Button 
                asChild
                className="bg-primary text-primary-foreground hover:opacity-90"
                data-testid="download-button"
              >
                <a href={`/api/conversions/${conversion.id}/download`} download>
                  <i className="fas fa-download mr-2"></i>
                  Download JSON
                </a>
              </Button>
              <Button 
                variant="secondary"
                className="bg-secondary text-secondary-foreground hover:opacity-90"
                data-testid="view-button"
                onClick={() => {
                  const outputSection = document.getElementById('json-output');
                  outputSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <i className="fas fa-eye mr-2"></i>
                View Output
              </Button>
            </div>
          </div>
        ) : (
          <div data-testid="processing-state">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-card-foreground">Processing...</span>
                  <span className="text-sm font-semibold text-primary" data-testid="progress-percent">
                    {conversion.progress}%
                  </span>
                </div>
                <div className="bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="progress-bar bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${conversion.progress}%` }}
                    data-testid="progress-bar"
                  ></div>
                </div>
              </div>

              {/* Status Steps */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center ${getStepBgColor(getStepState("validation"))}`}>
                    <StepIcon state={getStepState("validation")} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-card-foreground">File Validation</p>
                    <p className="text-xs text-muted-foreground">PDF structure verified</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center ${getStepBgColor(getStepState("extraction"))}`}>
                    <StepIcon state={getStepState("extraction")} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-card-foreground">Text Extraction</p>
                    <p className="text-xs text-muted-foreground">Parsing PDF content...</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center ${getStepBgColor(getStepState("generation"))}`}>
                    <StepIcon state={getStepState("generation")} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-card-foreground">JSON Generation</p>
                    <p className="text-xs text-muted-foreground">
                      {getStepState("generation") === "active" ? "Generating..." : "Waiting..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

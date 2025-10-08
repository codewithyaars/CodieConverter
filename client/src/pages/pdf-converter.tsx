import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import ConversionStatus from "@/components/conversion-status";
import JSONOutput from "@/components/json-output";

export default function PDFConverter() {
  const [activeConversion, setActiveConversion] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(false);

  const handleConversionStart = (conversionId: string) => {
    setActiveConversion(conversionId);
    setShowOutput(false);
  };

  const handleConversionComplete = () => {
    setShowOutput(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <i className="fas fa-file-pdf text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-sans text-foreground">PDF to JSON Converter</h1>
                <p className="text-sm text-muted-foreground">Dataset Training Tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Max File Size</p>
                <p className="text-sm font-semibold text-foreground">1000 MB</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 bg-accent/30 border border-accent rounded-lg p-4 flex items-start space-x-3">
          <i className="fas fa-info-circle text-accent-foreground text-xl mt-0.5"></i>
          <div className="flex-1">
            <h3 className="font-semibold text-accent-foreground mb-1">About This Tool</h3>
            <p className="text-sm text-accent-foreground/80">
              Convert PDF files to structured JSON format for efficient model training. Supports text extraction, 
              metadata parsing, and form field detection using pdf2json library.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <FileUpload onConversionStart={handleConversionStart} />
          <ConversionStatus 
            conversionId={activeConversion} 
            onConversionComplete={handleConversionComplete}
          />
        </div>

        {/* JSON Output */}
        {showOutput && activeConversion && (
          <JSONOutput conversionId={activeConversion} />
        )}

        {/* Technical Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold font-sans mb-4 text-card-foreground flex items-center">
                <i className="fas fa-code text-primary mr-2"></i>
                Technical Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Library</span>
                  <span className="text-sm font-semibold text-card-foreground">pdf2json v3.2.2</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Max File Size</span>
                  <span className="text-sm font-semibold text-card-foreground">1000 MB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Output Format</span>
                  <span className="text-sm font-semibold text-card-foreground">JSON</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Encoding</span>
                  <span className="text-sm font-semibold text-card-foreground">UTF-8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold font-sans mb-4 text-card-foreground flex items-center">
                <i className="fas fa-list-check text-primary mr-2"></i>
                Extraction Features
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fas fa-check-circle text-chart-2 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Text Content</p>
                    <p className="text-xs text-muted-foreground">Full text extraction with formatting</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fas fa-check-circle text-chart-2 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Metadata Parsing</p>
                    <p className="text-xs text-muted-foreground">Title, author, creation date, etc.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fas fa-check-circle text-chart-2 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Form Fields</p>
                    <p className="text-xs text-muted-foreground">Interactive form data extraction</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fas fa-check-circle text-chart-2 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Page Structure</p>
                    <p className="text-xs text-muted-foreground">Maintain document hierarchy</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-muted/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold font-sans mb-4 text-foreground flex items-center">
            <i className="fas fa-book text-primary mr-2"></i>
            Usage Instructions
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold mb-3">1</div>
              <h4 className="font-semibold text-foreground mb-2">Upload Your PDF</h4>
              <p className="text-sm text-muted-foreground">
                Drag and drop your PDF file or click to browse. Files up to 1000MB are supported.
              </p>
            </div>
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold mb-3">2</div>
              <h4 className="font-semibold text-foreground mb-2">Convert to JSON</h4>
              <p className="text-sm text-muted-foreground">
                Click the convert button and watch the real-time progress as your PDF is processed.
              </p>
            </div>
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold mb-3">3</div>
              <h4 className="font-semibold text-foreground mb-2">Download or Use</h4>
              <p className="text-sm text-muted-foreground">
                Download the JSON file or copy the output directly for your dataset training needs.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">© 2024 PDF to JSON Converter. Built for efficient dataset training.</p>
              <p className="text-xs text-muted-foreground mt-1">Powered by pdf2json library</p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Reference</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

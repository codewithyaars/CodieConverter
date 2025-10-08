import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertConversionSchema, updateConversionSchema } from "@shared/schema";
import { z } from "zod";
import PDFParser from "pdf2json";
import { PassThrough } from "stream";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for large file uploads (1000MB limit)
  const upload = multer({
    limits: {
      fileSize: 1000 * 1024 * 1024, // 1000MB
    },
    storage: multer.memoryStorage(),
  });

  // Upload PDF file and start conversion
  app.post("/api/conversions", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
      }

      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "File must be a PDF" });
      }

      // Create conversion record
      const conversionData = {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        status: "processing" as const,
        progress: 0,
        jsonData: null,
        errorMessage: null,
      };

      const conversion = await storage.createConversion(conversionData);

      // Start PDF conversion in background
      convertPDFToJSON(conversion.id, req.file.buffer);

      res.json(conversion);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Get conversion status
  app.get("/api/conversions/:id", async (req, res) => {
    try {
      const conversion = await storage.getConversion(req.params.id);
      if (!conversion) {
        return res.status(404).json({ message: "Conversion not found" });
      }
      res.json(conversion);
    } catch (error) {
      console.error("Get conversion error:", error);
      res.status(500).json({ message: "Failed to get conversion" });
    }
  });

  // Download JSON file
  app.get("/api/conversions/:id/download", async (req, res) => {
    try {
      const conversion = await storage.getConversion(req.params.id);
      if (!conversion) {
        return res.status(404).json({ message: "Conversion not found" });
      }

      if (conversion.status !== "completed" || !conversion.jsonData) {
        return res.status(400).json({ message: "Conversion not completed" });
      }

      const fileName = conversion.fileName.replace(/\.pdf$/i, ".json");
      
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.send(JSON.stringify(conversion.jsonData, null, 2));
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Get all conversions
  app.get("/api/conversions", async (req, res) => {
    try {
      const conversions = await storage.getAllConversions();
      res.json(conversions);
    } catch (error) {
      console.error("Get conversions error:", error);
      res.status(500).json({ message: "Failed to get conversions" });
    }
  });

  async function convertPDFToJSON(conversionId: string, pdfBuffer: Buffer) {
    // Store original console methods and stderr.write at function level
    const originalWarn = console.warn;
    const originalLog = console.log;
    const originalStderrWrite = process.stderr.write;
    
    try {
      // Update progress to 10%
      await storage.updateConversion(conversionId, { progress: 10 });

      // Comprehensive warning suppression - override all output methods
      console.warn = () => {}; // Completely suppress console.warn during PDF processing
      console.log = (message: any, ...args: any[]) => {
        const msgStr = String(message);
        if (!msgStr.includes('TODO:') && !msgStr.includes('Warning:') && !msgStr.includes('graphic state operator')) {
          originalLog(message, ...args);
        }
      };

      // Override stderr.write to catch all warning output
      process.stderr.write = function(chunk: any, encoding?: any, callback?: any): boolean {
        const chunkStr = String(chunk);
        if (chunkStr.includes('TODO:') || 
            chunkStr.includes('Warning:') ||
            chunkStr.includes('graphic state operator') ||
            chunkStr.includes('SMask')) {
          // Silently ignore these warnings
          if (typeof callback === 'function') callback();
          return true;
        }
        return originalStderrWrite.call(process.stderr, chunk, encoding, callback);
      };

      const pdfParser = new PDFParser(null, true);

      pdfParser.on("pdfParser_dataError", async (errData: any) => {
        // Restore console methods and stderr
        console.warn = originalWarn;
        console.log = originalLog;
        process.stderr.write = originalStderrWrite;
        console.error("PDF parsing error:", errData);
        await storage.updateConversion(conversionId, {
          status: "failed",
          errorMessage: errData.parserError?.toString() || "PDF parsing failed",
          progress: 0,
        });
      });

      pdfParser.on("pdfParser_dataReady", async (pdfData) => {
        // Restore console methods and stderr
        console.warn = originalWarn;
        console.log = originalLog;
        process.stderr.write = originalStderrWrite;
        try {
          // Update progress to 80%
          await storage.updateConversion(conversionId, { progress: 80 });

          // Process the PDF data into a more structured format
          const processedData = processPDFData(pdfData);

          // Update progress to 100% and mark as completed
          await storage.updateConversion(conversionId, {
            status: "completed",
            progress: 100,
            jsonData: processedData,
          });
        } catch (error) {
          console.error("Data processing error:", error);
          await storage.updateConversion(conversionId, {
            status: "failed",
            errorMessage: "Failed to process PDF data",
            progress: 0,
          });
        }
      });

      // Update progress to 30%
      await storage.updateConversion(conversionId, { progress: 30 });

      // Parse the PDF buffer
      pdfParser.parseBuffer(pdfBuffer);

      // Update progress to 60%
      setTimeout(async () => {
        await storage.updateConversion(conversionId, { progress: 60 });
      }, 1000);

    } catch (error) {
      // Restore console methods and stderr in case of error
      console.warn = originalWarn;
      console.log = originalLog;
      process.stderr.write = originalStderrWrite;
      console.error("Conversion error:", error);
      await storage.updateConversion(conversionId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
        progress: 0,
      });
    }
  }

  function processPDFData(pdfData: any) {
    const result = {
      metadata: {
        title: pdfData.Meta?.Title || "",
        author: pdfData.Meta?.Author || "",
        creator: pdfData.Meta?.Creator || "",
        producer: pdfData.Meta?.Producer || "",
        creationDate: pdfData.Meta?.CreationDate || "",
        modificationDate: pdfData.Meta?.ModDate || "",
        pages: pdfData.Pages?.length || 0,
      },
      pages: [],
      formFields: [],
      statistics: {
        totalPages: 0,
        totalWords: 0,
        totalCharacters: 0,
        hasImages: false,
        hasFormFields: false,
      },
    };

    // Process pages
    if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
      result.pages = pdfData.Pages.map((page: any, index: number) => {
        const pageTexts: string[] = [];
        const pageData: {
          pageNumber: number;
          width: number;
          height: number;
          texts: any[];
          hasImages: boolean;
          fills: any[];
          content: string;
        } = {
          pageNumber: index + 1,
          width: page.Width || 0,
          height: page.Height || 0,
          texts: [],
          hasImages: false,
          fills: page.Fills || [],
          content: "",
        };

        // Extract text content
        if (page.Texts && Array.isArray(page.Texts)) {
          page.Texts.forEach((textItem: any) => {
            if (textItem.R && Array.isArray(textItem.R)) {
              textItem.R.forEach((run: any) => {
                if (run.T) {
                  const decodedText = decodeURIComponent(run.T);
                  pageTexts.push(decodedText);
                  pageData.texts.push({
                    text: decodedText,
                    x: textItem.x || 0,
                    y: textItem.y || 0,
                    width: textItem.w || 0,
                    height: textItem.oc || 0,
                    fontFace: run.TS?.[0] || 0,
                    fontSize: run.TS?.[1] || 12,
                    fontStyle: run.TS?.[2] || 0,
                    color: run.TS?.[3] || "#000000",
                  });
                }
              });
            }
          });
        }

        pageData.content = pageTexts.join(" ");
        pageData.hasImages = (page.VLines?.length > 0) || (page.HLines?.length > 0) || (page.Fills?.length > 0);

        return pageData;
      });

      // Update statistics
      result.statistics.totalPages = result.pages.length;
      result.statistics.totalWords = result.pages.reduce((total, page: any) => {
        return total + (page.content ? page.content.split(/\s+/).length : 0);
      }, 0);
      result.statistics.totalCharacters = result.pages.reduce((total, page: any) => {
        return total + (page.content ? page.content.length : 0);
      }, 0);
      result.statistics.hasImages = result.pages.some((page: any) => page.hasImages);
    }

    // Process form fields
    if (pdfData.Fields && Array.isArray(pdfData.Fields)) {
      result.formFields = pdfData.Fields.map((field: any) => ({
        name: field.name || "",
        type: field.type || "text",
        value: field.value || "",
        required: field.required || false,
        readOnly: field.readOnly || false,
        page: field.page || 1,
      }));
      result.statistics.hasFormFields = result.formFields.length > 0;
    }

    result.metadata.pages = result.statistics.totalPages;

    return result;
  }

  const httpServer = createServer(app);
  return httpServer;
}

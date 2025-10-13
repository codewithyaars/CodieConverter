"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var http_1 = require("http");
var multer_1 = require("multer");
var storage_1 = require("./storage");
var pdf2json_1 = require("pdf2json");
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        function convertPDFToJSON(conversionId, pdfBuffer) {
            return __awaiter(this, void 0, void 0, function () {
                var originalWarn, originalLog, originalStderrWrite, pdfParser, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            originalWarn = console.warn;
                            originalLog = console.log;
                            originalStderrWrite = process.stderr.write;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 6]);
                            // Update progress to 10%
                            return [4 /*yield*/, storage_1.storage.updateConversion(conversionId, { progress: 10 })];
                        case 2:
                            // Update progress to 10%
                            _a.sent();
                            // Comprehensive warning suppression - override all output methods
                            console.warn = function () { }; // Completely suppress console.warn during PDF processing
                            console.log = function (message) {
                                var args = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args[_i - 1] = arguments[_i];
                                }
                                var msgStr = String(message);
                                if (!msgStr.includes('TODO:') && !msgStr.includes('Warning:') && !msgStr.includes('graphic state operator')) {
                                    originalLog.apply(void 0, __spreadArray([message], args, false));
                                }
                            };
                            // Override stderr.write to catch all warning output
                            process.stderr.write = function (chunk, encoding, callback) {
                                var chunkStr = String(chunk);
                                if (chunkStr.includes('TODO:') ||
                                    chunkStr.includes('Warning:') ||
                                    chunkStr.includes('graphic state operator') ||
                                    chunkStr.includes('SMask')) {
                                    // Silently ignore these warnings
                                    if (typeof callback === 'function')
                                        callback();
                                    return true;
                                }
                                return originalStderrWrite.call(process.stderr, chunk, encoding, callback);
                            };
                            pdfParser = new pdf2json_1.default(null, true);
                            pdfParser.on("pdfParser_dataError", function (errData) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            // Restore console methods and stderr
                                            console.warn = originalWarn;
                                            console.log = originalLog;
                                            process.stderr.write = originalStderrWrite;
                                            console.error("PDF parsing error:", errData);
                                            return [4 /*yield*/, storage_1.storage.updateConversion(conversionId, {
                                                    status: "failed",
                                                    errorMessage: ((_a = errData.parserError) === null || _a === void 0 ? void 0 : _a.toString()) || "PDF parsing failed",
                                                    progress: 0,
                                                })];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            pdfParser.on("pdfParser_dataReady", function (pdfData) { return __awaiter(_this, void 0, void 0, function () {
                                var processedData, error_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            // Restore console methods and stderr
                                            console.warn = originalWarn;
                                            console.log = originalLog;
                                            process.stderr.write = originalStderrWrite;
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 4, , 6]);
                                            // Update progress to 80%
                                            return [4 /*yield*/, storage_1.storage.updateConversion(conversionId, { progress: 80 })];
                                        case 2:
                                            // Update progress to 80%
                                            _a.sent();
                                            processedData = processPDFData(pdfData);
                                            // Update progress to 100% and mark as completed
                                            return [4 /*yield*/, storage_1.storage.updateConversion(conversionId, {
                                                    status: "completed",
                                                    progress: 100,
                                                    jsonData: processedData,
                                                })];
                                        case 3:
                                            // Update progress to 100% and mark as completed
                                            _a.sent();
                                            return [3 /*break*/, 6];
                                        case 4:
                                            error_2 = _a.sent();
                                            console.error("Data processing error:", error_2);
                                            return [4 /*yield*/, storage_1.storage.updateConversion(conversionId, {
                                                    status: "failed",
                                                    errorMessage: "Failed to process PDF data",
                                                    progress: 0,
                                                })];
                                        case 5:
                                            _a.sent();
                                            return [3 /*break*/, 6];
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            }); });
                            // Update progress to 30%
                            return [4 /*yield*/, storage_1.storage.updateConversion(conversionId, { progress: 30 })];
                        case 3:
                            // Update progress to 30%
                            _a.sent();
                            // Parse the PDF buffer
                            pdfParser.parseBuffer(pdfBuffer);
                            // Update progress to 60%
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, storage_1.storage.updateConversion(conversionId, { progress: 60 })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 1000);
                            return [3 /*break*/, 6];
                        case 4:
                            error_1 = _a.sent();
                            // Restore console methods and stderr in case of error
                            console.warn = originalWarn;
                            console.log = originalLog;
                            process.stderr.write = originalStderrWrite;
                            console.error("Conversion error:", error_1);
                            return [4 /*yield*/, storage_1.storage.updateConversion(conversionId, {
                                    status: "failed",
                                    errorMessage: error_1 instanceof Error ? error_1.message : "Unknown error occurred",
                                    progress: 0,
                                })];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }
        function processPDFData(pdfData) {
            var _a, _b, _c, _d, _e, _f, _g;
            var result = {
                metadata: {
                    title: ((_a = pdfData.Meta) === null || _a === void 0 ? void 0 : _a.Title) || "",
                    author: ((_b = pdfData.Meta) === null || _b === void 0 ? void 0 : _b.Author) || "",
                    creator: ((_c = pdfData.Meta) === null || _c === void 0 ? void 0 : _c.Creator) || "",
                    producer: ((_d = pdfData.Meta) === null || _d === void 0 ? void 0 : _d.Producer) || "",
                    creationDate: ((_e = pdfData.Meta) === null || _e === void 0 ? void 0 : _e.CreationDate) || "",
                    modificationDate: ((_f = pdfData.Meta) === null || _f === void 0 ? void 0 : _f.ModDate) || "",
                    pages: ((_g = pdfData.Pages) === null || _g === void 0 ? void 0 : _g.length) || 0,
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
                result.pages = pdfData.Pages.map(function (page, index) {
                    var _a, _b, _c;
                    var pageTexts = [];
                    var pageData = {
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
                        page.Texts.forEach(function (textItem) {
                            if (textItem.R && Array.isArray(textItem.R)) {
                                textItem.R.forEach(function (run) {
                                    var _a, _b, _c, _d;
                                    if (run.T) {
                                        var decodedText = decodeURIComponent(run.T);
                                        pageTexts.push(decodedText);
                                        pageData.texts.push({
                                            text: decodedText,
                                            x: textItem.x || 0,
                                            y: textItem.y || 0,
                                            width: textItem.w || 0,
                                            height: textItem.oc || 0,
                                            fontFace: ((_a = run.TS) === null || _a === void 0 ? void 0 : _a[0]) || 0,
                                            fontSize: ((_b = run.TS) === null || _b === void 0 ? void 0 : _b[1]) || 12,
                                            fontStyle: ((_c = run.TS) === null || _c === void 0 ? void 0 : _c[2]) || 0,
                                            color: ((_d = run.TS) === null || _d === void 0 ? void 0 : _d[3]) || "#000000",
                                        });
                                    }
                                });
                            }
                        });
                    }
                    pageData.content = pageTexts.join(" ");
                    pageData.hasImages = (((_a = page.VLines) === null || _a === void 0 ? void 0 : _a.length) > 0) || (((_b = page.HLines) === null || _b === void 0 ? void 0 : _b.length) > 0) || (((_c = page.Fills) === null || _c === void 0 ? void 0 : _c.length) > 0);
                    return pageData;
                });
                // Update statistics
                result.statistics.totalPages = result.pages.length;
                result.statistics.totalWords = result.pages.reduce(function (total, page) {
                    return total + (page.content ? page.content.split(/\s+/).length : 0);
                }, 0);
                result.statistics.totalCharacters = result.pages.reduce(function (total, page) {
                    return total + (page.content ? page.content.length : 0);
                }, 0);
                result.statistics.hasImages = result.pages.some(function (page) { return page.hasImages; });
            }
            // Process form fields
            if (pdfData.Fields && Array.isArray(pdfData.Fields)) {
                result.formFields = pdfData.Fields.map(function (field) { return ({
                    name: field.name || "",
                    type: field.type || "text",
                    value: field.value || "",
                    required: field.required || false,
                    readOnly: field.readOnly || false,
                    page: field.page || 1,
                }); });
                result.statistics.hasFormFields = result.formFields.length > 0;
            }
            result.metadata.pages = result.statistics.totalPages;
            return result;
        }
        var upload, httpServer;
        var _this = this;
        return __generator(this, function (_a) {
            upload = (0, multer_1.default)({
                limits: {
                    fileSize: 1000 * 1024 * 1024, // 1000MB
                },
                storage: multer_1.default.memoryStorage(),
            });
            // Upload PDF file and start conversion
            app.post("/api/conversions", upload.single("pdf"), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var conversionData, conversion, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (!req.file) {
                                return [2 /*return*/, res.status(400).json({ message: "No PDF file uploaded" })];
                            }
                            if (req.file.mimetype !== "application/pdf") {
                                return [2 /*return*/, res.status(400).json({ message: "File must be a PDF" })];
                            }
                            conversionData = {
                                fileName: req.file.originalname,
                                fileSize: req.file.size,
                                status: "processing",
                                progress: 0,
                                jsonData: null,
                                errorMessage: null,
                            };
                            return [4 /*yield*/, storage_1.storage.createConversion(conversionData)];
                        case 1:
                            conversion = _a.sent();
                            // Start PDF conversion in background
                            convertPDFToJSON(conversion.id, req.file.buffer);
                            res.json(conversion);
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            console.error("Upload error:", error_3);
                            res.status(500).json({ message: "Failed to upload file" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get conversion status
            app.get("/api/conversions/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var conversion, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getConversion(req.params.id)];
                        case 1:
                            conversion = _a.sent();
                            if (!conversion) {
                                return [2 /*return*/, res.status(404).json({ message: "Conversion not found" })];
                            }
                            res.json(conversion);
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            console.error("Get conversion error:", error_4);
                            res.status(500).json({ message: "Failed to get conversion" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Download JSON file
            app.get("/api/conversions/:id/download", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var conversion, fileName, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getConversion(req.params.id)];
                        case 1:
                            conversion = _a.sent();
                            if (!conversion) {
                                return [2 /*return*/, res.status(404).json({ message: "Conversion not found" })];
                            }
                            if (conversion.status !== "completed" || !conversion.jsonData) {
                                return [2 /*return*/, res.status(400).json({ message: "Conversion not completed" })];
                            }
                            fileName = conversion.fileName.replace(/\.pdf$/i, ".json");
                            res.setHeader("Content-Type", "application/json");
                            res.setHeader("Content-Disposition", "attachment; filename=\"".concat(fileName, "\""));
                            res.send(JSON.stringify(conversion.jsonData, null, 2));
                            return [3 /*break*/, 3];
                        case 2:
                            error_5 = _a.sent();
                            console.error("Download error:", error_5);
                            res.status(500).json({ message: "Failed to download file" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get all conversions
            app.get("/api/conversions", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var conversions, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getAllConversions()];
                        case 1:
                            conversions = _a.sent();
                            res.json(conversions);
                            return [3 /*break*/, 3];
                        case 2:
                            error_6 = _a.sent();
                            console.error("Get conversions error:", error_6);
                            res.status(500).json({ message: "Failed to get conversions" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            httpServer = (0, http_1.createServer)(app);
            return [2 /*return*/, httpServer];
        });
    });
}

# PDF to JSON Converter

## Overview

This is a web application that converts PDF files to JSON format for dataset training purposes. Users can upload PDF files (up to 1GB), monitor the conversion progress in real-time, and download the resulting JSON data. The application features a modern, responsive UI built with React and shadcn/ui components, with a Node.js/Express backend handling PDF processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript and Vite for fast development and optimized production builds.

**UI Component Library**: shadcn/ui (Radix UI primitives) for accessible, customizable components with Tailwind CSS for styling. The design uses a "new-york" style variant with a neutral base color scheme and custom CSS variables for theming.

**State Management**: TanStack Query (React Query) for server state management, with custom query client configuration. The application uses real-time polling (1-second intervals) to track conversion progress.

**Routing**: Wouter for lightweight client-side routing, currently implementing a simple single-page structure with a PDF converter page and 404 handling.

**Form Handling**: React Hook Form with Zod resolvers for type-safe form validation, integrated with the shadcn/ui form components.

**File Upload**: React Dropzone for drag-and-drop file upload functionality, supporting PDF files up to 1000MB.

### Backend Architecture

**Runtime**: Node.js with Express.js framework running in ESM (ECMAScript Module) mode.

**Development Setup**: TypeScript with tsx for development hot-reloading. Production builds use esbuild for fast bundling.

**File Upload Processing**: Multer middleware configured for large file uploads (1000MB limit) with in-memory storage. PDF parsing is handled by pdf2json library for text and structure extraction.

**API Design**: RESTful endpoints with `/api` prefix. JSON responses with comprehensive error handling and request logging middleware.

**Development Tools**: Vite integration for HMR (Hot Module Replacement) in development, with custom middleware for serving the React application.

### Data Storage Architecture

**Primary Database**: PostgreSQL (via Neon serverless driver) with Drizzle ORM for type-safe database operations.

**Schema Design**: Single `conversions` table tracking:
- File metadata (name, size)
- Processing status (uploading, processing, completed, failed)
- Progress percentage
- JSON output data
- Error messages
- Timestamps (created, completed)

**Development Storage**: In-memory storage implementation (`MemStorage` class) for development/testing without database dependencies. Uses Map data structure with UUID-based record identification.

**Schema Validation**: Zod schemas generated from Drizzle table definitions for runtime validation of insert and update operations.

### PDF Processing Pipeline

**Conversion Flow**:
1. File upload and validation (MIME type checking)
2. Conversion record creation with "processing" status
3. Background PDF parsing using pdf2json
4. Progress tracking with incremental updates (10%, 60%, 100%)
5. JSON data storage and status updates

**Error Handling**: Comprehensive error catching with user-friendly messages, tracking failures in the database with error details.

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database (configured for Neon serverless)
- **Drizzle ORM**: Type-safe database queries and schema management
- **drizzle-zod**: Automatic Zod schema generation from Drizzle schemas

### PDF Processing
- **pdf2json**: PDF parsing and text extraction library
- **multer**: Multipart form data handling for file uploads

### Frontend Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives (30+ components including dialogs, dropdowns, tooltips, etc.)
- **TanStack Query**: Server state management and data fetching
- **Wouter**: Lightweight routing solution
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **React Dropzone**: File upload with drag-and-drop
- **Tailwind CSS**: Utility-first styling framework
- **class-variance-authority & clsx**: Dynamic className management

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the stack
- **esbuild**: Production backend bundling
- **Replit plugins**: Development banner, error overlay, and cartographer for Replit environment integration

### Fonts & Icons
- **Font Awesome**: Icon library
- **Google Fonts**: Space Grotesk (headings), Geist (body text), Geist Mono (monospace)

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions (configured but session implementation not visible in provided files)
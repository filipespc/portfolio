# Portfolio Application - Architecture Guide

## Overview

This is a full-stack portfolio application built with React, Express, and PostgreSQL. The application allows users to manage and showcase professional experiences with a clean, modern interface. It features a monorepo structure with shared schema definitions and separate client/server directories.

## System Architecture

### Monorepo Structure
- **Client**: React frontend with Vite build system
- **Server**: Express.js backend with TypeScript
- **Shared**: Common schema definitions and types using Drizzle ORM
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Styling**: TailwindCSS with custom design system

## Key Components

### Frontend Architecture
- **Component Structure**: Uses shadcn/ui component library for consistent UI
- **State Management**: TanStack Query handles all server state and caching
- **Routing**: Simple client-side routing with Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Custom design system with portfolio-specific color palette

### Backend Architecture
- **API Design**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Storage Interface**: Abstracted storage layer with in-memory fallback
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Custom middleware for API request logging

### Database Schema
Two main entities:
- **Users**: Basic user management (username, password)
- **Experiences**: Professional experience records with rich metadata
  - Job details (title, industry, dates, current job flag)
  - Descriptions and accomplishments
  - Tools/technologies used (stored as JSON array)
  - Education/certifications (stored as JSON array)

## Data Flow

1. **Client Requests**: React components use TanStack Query hooks
2. **API Layer**: Express routes handle CRUD operations
3. **Validation**: Zod schemas validate input data
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: JSON responses with proper error handling

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Cloud PostgreSQL database
- **Connection**: Uses `@neondatabase/serverless` driver
- **Migration**: Drizzle Kit for schema migrations

### UI Libraries
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **TailwindCSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Frontend build tool with HMR
- **ESBuild**: Server bundling for production
- **TypeScript**: Type safety across the stack

## Deployment Strategy

### Development
- **Dev Server**: Vite dev server with Express API proxy
- **Hot Reload**: Full-stack hot reloading in development
- **Database**: Connects to remote PostgreSQL instance

### Production
- **Build Process**: Vite builds frontend, ESBuild bundles server
- **Static Assets**: Frontend builds to `dist/public`
- **Server**: Node.js serves both API and static files
- **Database**: Production PostgreSQL connection via environment variables

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Ports**: Server runs on port 5000, mapped to external port 80
- **Environment**: Configured for Replit's autoscale deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 19, 2025. Initial setup
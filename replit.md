# Portfolio Application - Architecture Guide

## Overview

This is a full-stack portfolio application built with React, Express, and PostgreSQL. The application provides a public portfolio view and a secure admin area for content management. It features a clean, minimalist design with comprehensive experience management capabilities and multiple view modes.

## System Architecture

### Monorepo Structure
- **Client**: React frontend with Vite build system
- **Server**: Express.js backend with TypeScript
- **Shared**: Common schema definitions and types using Drizzle ORM
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js, TypeScript, Drizzle ORM, bcrypt for authentication
- **Database**: PostgreSQL (Neon serverless) with session storage
- **Authentication**: Express sessions with PostgreSQL store
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Styling**: TailwindCSS with Sollo brand colors (red/gold accents)

## Key Features

### Public Portfolio
- **Hero Section**: Dynamic name and introduction from profile settings
- **Experience Views**: Multiple viewing modes (All, Tools, Industries, Education)
- **Clean Design**: Minimalist white-based design following Sollo brand guidelines
- **No Edit Controls**: Public view is read-only for visitors
- **Rich Text Rendering**: Full markdown support with formatting and nested lists

### Admin Dashboard
- **Secure Authentication**: Username/password login with session management
- **Profile Management**: Edit name, brief introduction, and education categories
- **Experience CRUD**: Full create, read, update, delete operations for experiences
- **Dynamic Categories**: Customizable education categories that update form options
- **Markdown Support**: Rich text formatting in descriptions and accomplishments

### Database Schema
Main entities:
- **Admin Users**: Secure admin authentication (username, hashed password)
- **Profile**: Site configuration (name, introduction, education categories)
- **Experiences**: Professional experience records with rich metadata
- **Sessions**: Secure session storage for authentication

## Authentication & Security

### Admin Access
- **Login Route**: `/admin/login` for admin authentication
- **Dashboard Route**: `/admin` redirects to login if not authenticated
- **Session-Based**: Secure sessions stored in PostgreSQL
- **Password Hashing**: bcrypt for secure password storage

### API Security
- **Public Routes**: Experience viewing and profile reading
- **Protected Routes**: All admin operations require authentication
- **Route Separation**: Admin routes prefixed with `/api/admin/`

## Design System

### Visual Guidelines
- **Base**: Predominantly white background with generous spacing
- **Typography**: Baron Neue for headings, Inter for body text
- **Colors**: Sollo red (R 217 G 39 B 45) and gold (R 223 G 138 B 0) as accents
- **Minimalism**: Clean lines, subtle textures, no heavy borders or shadows
- **Responsive**: Mobile-first design with proper breakpoints

## Data Management

### Experience Structure
- Job title, company name, industry, start/end dates
- Current job flag for ongoing positions
- Rich descriptions and accomplishments
- Tools with usage descriptions (JSON storage)
- Education with categorization, dates, and certificate links (JSON storage)

### Profile Configuration
- Editable site name and introduction
- Customizable education categories
- Dynamic form updates based on admin settings

## User Preferences

Preferred communication style: Simple, everyday language.

## Admin Setup

Admin credentials:
- Username: admin
- Password: [Contact administrator for secure credentials]
- Access via: `/admin` route

## Text Formatting Features

### Markdown Support
The application now supports comprehensive markdown formatting in experience descriptions and accomplishments:

**Nested Bullet Points:**
```
- Main point
  - Sub-point (2 spaces for indentation)
    - Nested sub-point (4 spaces for indentation)
- Another main point
```

**Text Formatting:**
- `**bold text**` renders as **bold text**
- `*italic text*` renders as *italic text*
- `` `code text` `` renders as `code text` with gray background

**Mixed Examples:**
```
Key accomplishments include:
- **Increased** user engagement by *40%*
- Led a team of `8 developers`
  - Implemented code review process
  - Mentored junior developers
- Deployed new `authentication system`
```

All markdown formatting works across:
- Public portfolio view
- Admin dashboard view
- All experience view modes (All, Tools, Industries, Education)

## Changelog

- June 19, 2025: Initial portfolio setup with experience management
- June 19, 2025: Added admin authentication system with PostgreSQL database
- June 19, 2025: Implemented profile management and dynamic education categories
- June 19, 2025: Separated public and admin functionality, removed edit controls from public view
- June 19, 2025: Added company field to experience records with proper database migration and UI updates
- June 19, 2025: Implemented comprehensive markdown support with nested bullet points, bold, italic, and code formatting
- June 19, 2025: Added date functionality to education entries with display across all views and admin editing interface
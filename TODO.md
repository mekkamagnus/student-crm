# TODO: Student CRM MVP - Phase 1

## Core Infrastructure
- [ ] Set up Deno project and basic HTTP server (`main.ts`, `deno.json`)
- [ ] Initialize SQLite database connection and define schema (`database.ts`)
- [ ] Integrate Handlebars templating engine

## Feature: CSV Data Import

### Backend: CSV Upload Endpoint
- [ ] Write tests for CSV upload endpoint
- [ ] Implement API endpoint for CSV file upload (`POST /api/import-csv`)

### Backend: CSV Parsing & Data Transformation
- [ ] Write tests for CSV parsing logic
- [ ] Implement CSV parsing to extract raw data
- [ ] Implement data transformation logic:
    - [ ] Map Chinese terms to English `OperationLog` types
    - [ ] Derive `targetAudience` for `MembershipPlan`
    - [ ] Generate unique IDs for `Membership` instances on 'purchase'
    - [ ] Link subsequent operations to the correct `Membership` instance

### Backend: Idempotent Data Storage
- [ ] Write tests for idempotent data storage
- [ ] Implement logic to store parsed data into SQLite, ensuring no duplicates

### Frontend: CSV Upload UI
- [ ] Write tests for CSV upload UI
- [ ] Create UI component for CSV file upload on the dashboard

## Feature: Member Management & Viewing

### Backend: Member Listing
- [ ] Write tests for member listing endpoint
- [ ] Implement API endpoint to retrieve all members (`GET /api/members`)

### Frontend: Member List Display
- [ ] Write tests for member list UI
- [ ] Create UI component to display a list of members

### Backend: Member Search
- [ ] Write tests for member search endpoint
- [ ] Implement API endpoint to search members by name/phone (`GET /api/members?search=...`)

### Frontend: Member Search UI
- [ ] Write tests for member search UI
- [ ] Create UI component for member search input and display results

### Backend: Member Detail & History
- [ ] Write tests for member detail and history endpoints
- [ ] Implement API endpoint to retrieve single member details (`GET /api/members/:id`)
- [ ] Implement API endpoint to retrieve a member's operation logs (`GET /api/members/:id/history`)

### Frontend: Member Detail & History Display
- [ ] Write tests for member detail and history UI
- [ ] Create UI components to display member details and their activity history

## Feature: Daily Activity View

### Backend: Daily Activity Listing
- [ ] Write tests for daily activity endpoint
- [ ] Implement API endpoint to retrieve operation logs by date (`GET /api/activities?date=...`)

### Frontend: Daily Activity Display
- [ ] Write tests for daily activity UI
- [ ] Create UI component for date selection and display of daily activities

## General Frontend (PWA)
- [ ] Create a single HTML file for the PWA dashboard
- [ ] Integrate HTMX into the frontend
- [ ] Integrate Tailwind CSS (CDN) for styling

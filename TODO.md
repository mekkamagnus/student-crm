# TODO: Student CRM MVP - Phase 1

## Core Infrastructure
- [x] Set up Deno project and basic HTTP server (`main.ts`, `deno.json`) #1
- [x] Initialize SQLite database connection and define schema (`database.ts`) #2
- [ ] Integrate Handlebars templating engine #3

## Feature: CSV Data Import

### Backend: CSV Upload Endpoint
- [ ] Write tests for CSV upload endpoint #4
- [ ] Implement API endpoint for CSV file upload (`POST /api/import-csv`) #5

### Backend: CSV Parsing & Data Transformation
- [ ] Write tests for CSV parsing logic #7
- [ ] Implement CSV parsing to extract raw data #8
- [ ] Implement data transformation logic:
    - [ ] Map Chinese terms to English `OperationLog` types #9
    - [ ] Derive `targetAudience` for `MembershipPlan` #10
    - [ ] Generate unique IDs for `Membership` instances on 'purchase' #11
    - [ ] Link subsequent operations to the correct `Membership` instance #12

### Backend: Idempotent Data Storage
- [ ] Write tests for idempotent data storage #13
- [ ] Implement logic to store parsed data into SQLite, ensuring no duplicates #14

### Frontend: CSV Upload UI
- [ ] Write tests for CSV upload UI #15
- [ ] Create UI component for CSV file upload on the dashboard #16

## Feature: Member Management & Viewing

### Backend: Member Listing
- [ ] Write tests for member listing endpoint #17
- [ ] Implement API endpoint to retrieve all members (`GET /api/members`) #18

### Frontend: Member List Display
- [ ] Write tests for member list UI #19
- [ ] Create UI component to display a list of members #20

### Backend: Member Search
- [ ] Write tests for member search endpoint #21
- [ ] Implement API endpoint to search members by name/phone (`GET /api/members?search=...`) #22

### Frontend: Member Search UI
- [ ] Write tests for member search UI #23
- [ ] Create UI component for member search input and display results #24

### Backend: Member Detail & History
- [ ] Write tests for member detail and history endpoints #25
- [ ] Implement API endpoint to retrieve single member details (`GET /api/members/:id`) #26
- [ ] Implement API endpoint to retrieve a member's operation logs (`GET /api/members/:id/history`) #27

### Frontend: Member Detail & History Display
- [ ] Write tests for member detail and history UI #28
- [ ] Create UI components to display member details and their activity history #29

## Feature: Daily Activity View

### Backend: Daily Activity Listing
- [ ] Write tests for daily activity endpoint #30
- [ ] Implement API endpoint to retrieve operation logs by date (`GET /api/activities?date=...`) #31

### Frontend: Daily Activity Display
- [ ] Write tests for daily activity UI #32
- [ ] Create UI component for date selection and display of daily activities #33

## General Frontend (PWA)
- [ ] Create a single HTML file for the PWA dashboard #34
- [ ] Integrate HTMX into the frontend #35
- [ ] Integrate Tailwind CSS (CDN) for styling #36

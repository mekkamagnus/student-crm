# TODO

## MVP Phase 1: CSV Import and Dashboard Display

### Backend

- [ ] Set up the basic server structure (Next)
- [ ] Implement the database schema based on the data model
- [ ] Create API endpoints for:
    - [ ] Uploading and processing CSV files
    - [ ] Retrieving parsed member and membership data for display
- [ ] Implement robust CSV parsing logic, including:
    - [ ] Mapping Chinese terms to English enums for `OperationLog` types
    - [ ] Deriving `targetAudience` for `MembershipPlan`
    - [ ] Generating unique IDs for `Membership` instances based on purchase operations
    - [ ] Linking subsequent operations to the correct `Membership` instance
    - [ ] Ensuring idempotent imports to prevent duplicate data

### Frontend

- [ ] Create a single HTML page for the PWA dashboard
- [ ] Implement UI for:
    - [ ] Uploading CSV files
    - [ ] Displaying a list of members
    - [ ] Displaying a member's details and activity history

### Data Migration

- [ ] (Covered by CSV parsing logic in Backend section)
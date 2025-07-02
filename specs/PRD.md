# Product Requirements Document: Student CRM

## 1. Introduction

This document outlines the product requirements for a new Student/Member CRM application for a dance studio. The primary goal for this Minimum Viable Product (MVP) is to replace the manual tracking of member activity (currently in a CSV file) by focusing on robust CSV parsing and displaying this information in an interactive dashboard. This application will be a single-page Progressive Web Application (PWA) to allow studio staff to efficiently view member data.

## 2. User Personas

*   **Studio Manager (e.g., "Jessica老师"):** Responsible for day-to-day operations, including selling memberships, handling customer issues, and tracking studio performance.
*   **System Administrator:** Responsible for data integrity and automated system processes.

## 3. User Stories

### As a Studio Manager, I want to...

*   ...**upload a CSV file** containing member activity data, so that the system can process and store it.
*   ...**view a list of all members** in the system, so I can quickly see who is registered.
*   ...**search for a member by name or phone number**, so I can quickly find their profile.
*   ...**view a member's detailed profile**, including their contact information and current membership status, so I have a complete overview.
*   ...**see a member's complete history of membership activities** (purchases, activations, edits, deletions), so I can understand their past interactions and resolve any inquiries.
*   ...**view a list of all membership activities that occurred on a specific day**, so I can reconcile daily sales and operations.

## 4. Functional Requirements

### 4.1. Member Management
- The system must store member contact information, including at least a name and a unique phone number.
- The system must allow staff to create, view, update, and (soft) delete member profiles.

### 4.2. Membership & Plan Management
- The system must track the status of a member's card (e.g., `active`, `inactive`, `expired`, `deleted`).
- The system must support different types of membership plans (e.g., monthly passes, class packages).
- The system must record the purchase of a new membership, linking it to a member.

### 4.3. Activity Logging
- Every significant action performed on a membership (purchase, activation, edit, deletion) must be logged.
- The log must include who performed the action, when it was performed, and the reason for the action.

## 5. Business Rules

- A member is uniquely identified by their phone number.
- A monthly membership automatically activates on the date of the first class attended.
- A class package (e.g., "20-class pack") is activated upon purchase or on a specified start date.
- All financial transactions, including purchases and refunds, must be recorded with the corresponding amount.

## 6. Data Import

- The system must provide a mechanism to import member activity from the existing iWo-generated CSV file.
- The import process must be idempotent, meaning that re-importing the same CSV file will not create duplicate records. The system should intelligently handle overlapping data between imports.

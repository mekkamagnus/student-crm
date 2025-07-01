# Product Requirements Document: Student CRM

## 1. Introduction

This document outlines the product requirements for a new Student/Member CRM application for a dance studio. The primary goal is to replace the manual tracking of member activity (currently in a CSV file) with a robust system that allows studio staff to manage members, their memberships, and their activity history efficiently.

## 2. User Personas

*   **Studio Manager (e.g., "Jessica老师"):** Responsible for day-to-day operations, including selling memberships, handling customer issues, and tracking studio performance.
*   **System Administrator:** Responsible for data integrity and automated system processes.

## 3. User Stories

### As a Studio Manager, I want to...

*   ...view a member's complete history, including all their past payments and class package changes, so I can resolve any billing disputes or answer their questions accurately.
*   ...be able to look up a member quickly by their name or phone number to see their current membership status.
*   ...easily sell a new membership package to a new or existing student.
*   ...edit a member's existing package (e.g., add classes, extend the expiration date) and log the reason for the change.
*   ...see a list of all membership activities that have occurred on a given day to reconcile daily sales.

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

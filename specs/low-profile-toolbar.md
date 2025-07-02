# Spec: Low-Profile Toolbar for Creating Notes

## High Level Objectives

**Create Note with Toolbar:**
As a user, I want a low-profile toolbar to quickly create a new note, so that my workflow is fast and intuitive.

## Low-level Objectives

- **Toolbar Implementation:**
  - A new toolbar will be added to the bottom of the note list.
  - The toolbar will contain a single "Create Note" button.
- **Create Note Logic:**
  - Clicking the button will send a `POST /notes` request.
  - A new, empty note will be created in the database.
  - The UI will be updated to show the new note in the editor, ready for input.
- **Testing:**
  - UI, integration, and unit tests will be added to verify the new functionality.

## 1. Overview

This document outlines the specifications for a new low-profile toolbar for creating notes. The design is inspired by the minimalist and intuitive UI of Apple Notes.

## 2. Core Concepts

### 2.1 User Experience

- **Toolbar Appearance and Placement:**
    -   **Placement:** The toolbar will be fixed at the bottom of the note list column (the left-hand column).
    -   **Content:** The toolbar will contain a single "Create Note" button.
    -   **Button Design:** The button will be visually simple, featuring a "new note" icon (e.g., a square with a plus sign or a pencil icon) and will not have a prominent background or border, making it "low-profile".
- **Interaction and Behavior:**
    -   When a user clicks the "Create Note" button, a new, empty note will be created.
    -   The application will immediately display this new note in the editor view (the right-hand column), ready for the user to start typing.
    -   The new note will be added to the top of the note list and will be visually selected as the active note.
-   **Focus:** Upon creation, the text area for the new note's content will be automatically focused, so the user can begin typing without any extra clicks.

### 2.2 Backend Logic

- The existing `POST /notes` endpoint will be used to create a new note.
- When the request is triggered by the toolbar button, the endpoint will create a note with empty content.
- The server will respond with multiple HTML fragments to update both the note list and the main editor view simultaneously.

## 3. Implementation Details

### 3.1 Frontend (`public/index.html`)

-   The "Create Note" button will be an HTML element (e.g., a `<button>` or an `<a>` tag) placed inside a new toolbar `div` at the bottom of the note list section.
-   It will use HTMX attributes to handle the creation logic:
    -   `hx-post="/notes"`: It will send a `POST` request to the `/notes` endpoint to create a new note.
    -   `hx-target-4xx="#error-container"`: It will target a container to display any client-side errors.
    -   The server response will contain multiple `hx-swap-oob` attributes to update the note list and editor view.

### 3.2 Backend (`src/main.ts`)

-   The `POST /notes` handler will be updated to handle requests with an empty body (or a specific parameter indicating a toolbar request).
-   If the body is empty, it will create a new note with an empty title and content.
-   The handler will return two HTML fragments: one for the updated note list and one for the new note editor view, using `hx-swap-oob` to target the correct elements.

### 3.3 Database (`src/db.ts`)

- No changes are required for the database logic. The existing `createNote` function will be used.

## 4. Testing Strategy

- **UI Tests (`test/ui.test.ts`):**
  - Test that the toolbar is visible on the page.
  - Test that clicking the "Create Note" button adds a new note to the list.
  - Test that the new note is displayed in the editor view and is ready for input.
- **Integration Tests (`test/main.test.ts`):**
  - Add tests for the `POST /notes` endpoint to verify it correctly handles requests from the new toolbar button (e.g., with an empty body).
- **Unit Tests (`test/db.test.ts`):**
  - No new unit tests are required as no database functions are being added or modified.

## 5. Benefits

- **Improved UX:** Provides a faster, more accessible, and intuitive way to create notes, reducing user friction.
- **Modern UI:** Aligns the application with modern design trends seen in popular note-taking apps like Apple Notes.

## 6. File Structure

```
.
├── public/
│   └── index.html      # Modified
├── specs/
│   └── low-profile-toolbar.md # This document
├── src/
│   ├── main.ts         # Modified
│   └── db.ts           # No changes
└── test/
    ├── main.test.ts    # Modified
    └── ui.test.ts        # Modified
```

## 7. Affected Files

- **Modified Files:**
  - `public/index.html`
  - `src/main.ts`
  - `test/main.test.ts`
  - `test/ui.test.ts`

## 8. Acceptance Criteria

-   A low-profile toolbar is present at the bottom of the note list.
-   Clicking the "Create Note" button creates a new note.
-   The new note appears in the editor, ready for input.
-   The note list is updated to include the new note.
-   The implementation does not break existing note creation functionality.
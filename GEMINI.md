## Project Context
- The CSV data for this project originates from an iWo WeChat miniapp, which serves as a backend for managing student/member activities in a dance studio.
- Future Goal: To build a custom WeChat miniapp to support online education (online/offline classes, live/recorded) for students.

## General Instructions
- This application is being developed with GEMINI CLI.
- The `ai_docs` directory contains information useful to the AI coding assistant, including aggregated GEMINI CLI documentation in `ai_docs/gemini_cli_docs.md`.
- Every time you choose to apply a rule(s), explicitly state the rule(s) in the output. You can abbreviate the 
  rule description to a single word or phrase
- Always follow a Test-Driven Development workflow.
- Functional programming should be used wherever possible.
- All functions and classes should have JS Doc comments
- Use arrow functions
- Use deno 2.3.7
- Write simple, verbose code over terse, dense code
- Use the standard library where possible. Avoid using external dependecies unless otherwise stated
- USE SQLite as a database
- Keep frontend webpage to ONE html file

## Functional Programming Conventions
- Use Either for operations that can fail
- Avoid throwing exceptions: Functions that can fail should return an `Either` type instead of throwing exceptions. This makes error handling explicit in the function signature.
- Prefer pure functions: Functions should aim to be pure, meaning they produce the same output for the same input and have no side effects (like modifying external state or throwing exceptions).
- Favor function composition: Utilize higher-order functions like `map` and `flatMap` (or `chain`) for composing operations, especially when dealing with `Either` types, to build complex logic from simpler, reusable functions.

## Task Management
- The purpose of `TODO.md` is to manage and display the progress of implementing the given spec.
- When a feature from `TODO.md` is implemented and verified, update its status in `TODO.md` to `[x]`.
- TODO.md tasks are marked complete ([x]) only after code is implemented and successfully verified through testing.
- During implementation, `TODO.md` should be updated in real time for proper tracking
- Test should be created before code
- When implementing from a spec, use `TODO.md` to show and manage the plan.

## Tech Stack
- **Backend Language:** TypeScript
- **Frontend Interactivity:** HTMX
- **Styling:** Tailwind CSS (CDN)
- **Database:** SQLite
- **Templating Engine:** Handlebars
- **Client-side Interactivity (sparse):** Alpine.js (to be infused much later in the development process)

### Deno Routing
- For routing, popular choices include Oak, Hono, and Opine. Hono is a strong candidate for its performance and lightweight nature. **Note: Routing will be implemented later and is not part of the initial MVP phase.**

## Deployment Considerations (Mainland China)
- The application will be primarily used and hosted in Mainland China.
- Considerations for China's Firewall: Prioritize local downloads for CDNs where possible to mitigate firewall issues.
- Configuration Management: Utilize `.env` files and clear separation of configurations for development vs. production environments.

## Testing
- Always follow a Test-Driven Development workflow. Create and run test before code implementation.
- Use 'deno test' for testing.
- All unit and integration tests should be placed directly in the `test` directory.
- All API endpoints should have test
- Tests should be written for each function.
- Aim for high test coverage, especially for core logic.
- Tests should be isolated and repeatable.
- Use clear and descriptive names for test files and test cases.
- Do not mock data
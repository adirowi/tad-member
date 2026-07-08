# Gemini Workspace Context - `tad-member`

This file serves as the foundational instruction manual and context guide for Gemini CLI interactions within the `tad-member` workspace.

---

## 1. Project Overview

This workspace is currently a **pristine, blank slate** with no pre-existing codebase or configuration files. It is ready for project setup, bootstrapping, and custom directory orchestration.

### Strategic Goals
- Establish a robust, scalable, and well-tested system according to the user's specific requirements.
- Maintain top-tier engineering standards from the start, ensuring clean directory structures, rigorous linting/formatting, and comprehensive unit-test coverage.

---

## 2. Bootstrapping Guidelines

Since the workspace is currently empty, the initial phase of development should follow these steps:

1. **Tech Stack Selection:** Align on the target technologies, language, and frameworks (e.g., React + TypeScript, Python + FastAPI/Flask, Go, Node.js, Rust + Cargo, etc.).
2. **Project Initialization:** Execute the ecosystem's initialization commands (e.g., `npm init`, `cargo init`, `go mod init`, `poetry init`) to bootstrap the environment.
3. **Directory Structure Setup:** Create organized folders following industry-standard practices (e.g., `/src` for source code, `/tests` for unit/integration tests, `/docs` for documentation).
4. **Update `GEMINI.md`:** Immediately update this file's **Environment & Tooling** and **Project Structure** sections once the tech stack has been initialized.

---

## 3. Engineering & Development Conventions

To maintain a clean, secure, and maintainable codebase, all subsequent developments must adhere strictly to these principles:

### A. Architectural Integrity
- **Modular & Component-Driven:** Prioritize highly cohesive, loosely coupled modules or components. Avoid monolithic, "god" files.
- **Composition over Inheritance:** Use explicit composition and delegation patterns over complex inheritance hierarchies.
- **Strict Typings & Safety:** Enforce static typing. Avoid arbitrary type suppressions (e.g., `any` in TypeScript, raw unsafe casts, ignoring linter warnings) unless explicitly requested. Use descriptive custom types or interfaces.
- **Robust Error Handling:** Always handle exceptions and errors gracefully. Avoid silent failures or empty catch/except blocks. Utilize domain-specific custom errors where helpful.

### B. Development Workflow
Always follow the **Research -> Strategy -> Execution -> Validation** lifecycle:
1. **Research:** Read existing configuration and code files, run tests, and check dependencies to understand impacts.
2. **Strategy:** Formulate a surgical, high-precision plan and share a concise summary.
3. **Execution (Plan -> Act -> Validate):**
   - **Plan:** Detail the specific implementation and corresponding test strategy.
   - **Act:** Apply precise, minimal, and elegant edits using targeted tools (like `replace` or `write_file`).
   - **Validate:** Run builds, linters, typecheckers, and tests to ensure absolute correctness.

### C. Testing & Validation Standards
- **No Untested Code:** Every feature, service, utility, or bug fix must be accompanied by relevant unit or integration tests.
- **Empirical Verification:** Always run the project's test suite to verify changes before completing a task. Never assume correctness without validation.
- **Test Locations:** Co-locate unit tests or place them in a dedicated `/tests` or `/__tests__` directory as appropriate for the language/ecosystem.

---

## 4. Environment & Tooling

Here are the key commands for managing, running, and deploying this Cloudflare Pages & D1 application.

| Action | Command | Description |
| :--- | :--- | :--- |
| **Install Wrangler** | `npm install -D wrangler` | Installs the Cloudflare developer CLI locally. |
| **Local DB Migration** | `npx wrangler d1 execute DB --local --file=schema.sql` | Creates and applies tables locally on the D1 database binding `DB`. |
| **Run App (Dev)** | `npx wrangler pages dev public --port 8788` | Runs the full-stack local server (static files and functions) on port 8788. |
| **Remote DB Migration** | `npx wrangler d1 execute <database_name> --remote --file=schema.sql` | Applies tables to your remote production D1 database instance. |
| **Deploy to Cloudflare** | `npx wrangler pages deploy public` | Deploys the static assets and Pages Functions directly to Cloudflare Pages. |

---

## 5. Memory & Context Tracking

- **Private Workspace Memory:** Private local-only setup details, environment variables, or machine-specific notes should be stored in the private project memory directory: `C:\Users\Adi.Rowi\.gemini\tmp\tad-member\memory\MEMORY.md` (never committed to Git).
- **Core Guidelines:** All team-shared architectural and workflow policies must reside directly in this `GEMINI.md` file (committed to Git).

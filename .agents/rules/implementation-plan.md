# Implementation Plan Structure Guide
# Activation: On Request (Triggered via @implementation-plan or when tasked with planning)

Whenever you are asked to create, update, or outline an implementation plan, you MUST follow this exact five-phase structural hierarchy. Do not skip sections, and do not change the order of execution.

## Phase 1: High-Level Project Understanding & Description
- Project Objective: Clear statement explaining the ultimate goal.
- General Description: Application overview, scope, and problem statement.
- Architectural Overview: High-level view of system data flow.

## Phase 2: Bottom-Up Element Summary & File System Layout
Summarize components strictly from data/backend up to presentation/frontend:
1. Data Layer & Core Logic (Schemas, utility scripts)
2. API & Routing Layer (Endpoints, controllers, payloads)
3. Frontend Layer (UI elements, native views)
4. Target File System Layout: Explicit ASCII tree structure of the workspace.

## Phase 3: Exhaustive Deep-Dive Specifications
- Backend Elements: Business logic, error-handling, dependencies, source file utilization.
- Frontend Elements: Layout mockups, semantic HTML positioning, native Vanilla JS event listeners, CSS variables.
- Data Flow & Interoperability: End-to-end trace of a data payload from disk/db to the DOM.

## Phase 4: Step-by-Step Verification Plan
- Isolated Backend/Logic Tests: Specific terminal execution test commands and parameters.
- API & Endpoint Integration Checks: Expected status codes, payload validations, and curl commands.
- Frontend & DOM Validation: Verification states, expected console logs, and DOM assertions.

## Phase 5: Operational & Deployment Specification
- Containerization Architecture: Multi-stage Dockerfile specs and localized docker-compose.yml setups.
- Orchestration & Kubernetes Settings: Deployment specs, resource limits, Services, and ConfigMaps/Secrets.
- Agentic Supervision & Telemetry: Runtime supervisor rules, monitoring conditions, and self-healing log/cache steps.
- Scheduled Tasks & Automation: Internal/system cron structures and background workers.

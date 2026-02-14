# Feature Specification: npm Migration for unlimited.rs Hosting

**Feature Branch**: `002-npm-migration`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "I am using unlimited.rs for hosting of the application. I want it to be in plain Node on backend, and on frontend you can decide and evaluate based on hosting requirement but i think that React is possible. Based on that it is not allowed to use pnpm only plain npm. Since hosting doesnt support it. Refactor the project build so that it can be hosted on unlimited.rs"

## User Scenarios & Testing

### User Story 1 - Deploy Application to unlimited.rs (Priority: P1)

As a developer, I need to deploy the Spanish Class application to unlimited.rs hosting so that students and professors can access the platform from anywhere.

**Why this priority**: This is the foundation for making the application accessible. Without successful deployment, the application cannot be used by end users. The current pnpm-based build system is incompatible with unlimited.rs hosting constraints.

**Independent Test**: Can be fully tested by running the build process with npm, deploying to unlimited.rs staging environment, and verifying that both frontend and backend are accessible and functional.

**Acceptance Scenarios**:

1. **Given** the project uses pnpm workspaces, **When** I migrate to npm workspaces, **Then** all packages install correctly and build successfully
2. **Given** the build completes with npm, **When** I deploy to unlimited.rs, **Then** the backend Node.js application starts and responds to requests
3. **Given** the deployment is complete, **When** I access the frontend URL, **Then** the React application loads and displays correctly
4. **Given** the application is deployed, **When** users interact with features, **Then** all functionality works identically to the local development environment

---

### User Story 2 - Maintain Development Workflow (Priority: P2)

As a developer, I need to maintain a smooth local development experience after migrating from pnpm to npm so that development velocity doesn't decrease.

**Why this priority**: While deployment is critical (P1), ensuring developers can work efficiently is important for ongoing development. This includes fast installs, proper workspace linking, and consistent scripts across packages.

**Independent Test**: Can be tested by running `npm install`, `npm run dev` in both packages, and verifying hot-reload, type checking, and linting work as expected.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** I run `npm install`, **Then** all dependencies install in under 2 minutes
2. **Given** packages are installed, **When** I run development scripts, **Then** both frontend and backend start with hot-reload enabled
3. **Given** I make code changes, **When** I save a file, **Then** the application reloads automatically without manual restarts
4. **Given** shared packages are modified, **When** I build them, **Then** dependent packages automatically detect the changes

---

### User Story 3 - Ensure Production Build Quality (Priority: P3)

As a developer, I need production builds to be optimized and free of development dependencies so that the deployed application is secure and performant.

**Why this priority**: Production optimization is important but less critical than basic deployment (P1) and development workflow (P2). This ensures the deployed application runs efficiently at scale.

**Independent Test**: Can be tested by running production builds, analyzing bundle sizes, and verifying no dev dependencies are included in production node_modules.

**Acceptance Scenarios**:

1. **Given** the project is ready for production, **When** I run production build, **Then** all assets are minified and optimized
2. **Given** production build completes, **When** I check node_modules, **Then** only production dependencies are present
3. **Given** the application is deployed, **When** I measure performance, **Then** page load times are under 2 seconds on 3G connection
4. **Given** the backend is running, **When** I check memory usage, **Then** it uses less than 512MB RAM under normal load

---

### Edge Cases

- What happens when npm workspace resolution fails due to circular dependencies?
- How does the system handle build failures during deployment to unlimited.rs?
- What happens if unlimited.rs imposes package size limits or deployment timeouts?
- How does the application behave if npm registry is temporarily unavailable during deployment?
- What happens when environment-specific configurations (localhost vs unlimited.rs domain) aren't properly set?

## Requirements

### Functional Requirements

- **FR-001**: Build system MUST use npm as the package manager instead of pnpm
- **FR-002**: Backend MUST run on plain Node.js without requiring pnpm-specific features
- **FR-003**: Frontend MUST build successfully using npm and be deployable as static assets or React SPA
- **FR-004**: All npm scripts MUST work across packages using npm workspace commands
- **FR-005**: Development environment MUST support hot-reload for both frontend and backend when using npm
- **FR-006**: Production build MUST generate optimized bundles suitable for unlimited.rs hosting
- **FR-007**: Package installation MUST complete successfully using only `npm install` without additional tools
- **FR-008**: Workspace dependencies (shared package) MUST resolve correctly using npm workspaces
- **FR-009**: Build process MUST be compatible with unlimited.rs deployment constraints (plain Node.js, standard npm)
- **FR-010**: All existing functionality MUST work identically after migration from pnpm to npm

### Key Entities

- **Workspace Configuration**: Defines how npm manages the monorepo structure with backend, frontend, and shared packages
- **Build Artifacts**: Generated output from npm build process that gets deployed to unlimited.rs
- **Deployment Configuration**: Settings specific to unlimited.rs hosting environment (Node.js version, start commands, environment variables)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Application builds successfully using `npm install && npm run build` in under 3 minutes
- **SC-002**: Application deploys to unlimited.rs staging environment without errors within 5 minutes
- **SC-003**: All existing features function identically between pnpm-based and npm-based builds (100% feature parity)
- **SC-004**: Development setup time for new contributors reduces to under 5 minutes (just `npm install`)
- **SC-005**: Production bundle size remains within 10% of current size (no significant bloat from migration)
- **SC-006**: Application handles at least 100 concurrent users on unlimited.rs hosting without performance degradation

## Assumptions

- **ASM-001**: unlimited.rs supports standard Node.js applications with npm (assuming Node 18+ based on current project)
- **ASM-002**: unlimited.rs allows serving React applications either as static files or via Node.js server
- **ASM-003**: Current workspace structure (packages/backend, packages/frontend, packages/shared) can be maintained with npm workspaces
- **ASM-004**: No pnpm-specific features (like patch-package or pnpm-only dependency resolution) are currently in use
- **ASM-005**: Environment variables can be configured in unlimited.rs deployment settings
- **ASM-006**: unlimited.rs provides sufficient resources (memory, CPU) for the application's current requirements
- **ASM-007**: Database connections and external services remain accessible from unlimited.rs infrastructure

## Dependencies

- **DEP-001**: unlimited.rs hosting account with appropriate plan for Node.js applications
- **DEP-002**: Access to unlimited.rs deployment dashboard and configuration settings
- **DEP-003**: Current package.json files from all packages to understand dependencies
- **DEP-004**: Documentation of unlimited.rs deployment process and constraints

## Out of Scope

- Changing application architecture beyond package manager migration
- Migrating away from React on frontend (React is confirmed as acceptable)
- Migrating away from Node.js/Express on backend
- Adding new features during migration (focus is on parity, not enhancements)
- Database migration or schema changes
- Setting up CI/CD pipelines (unless required for unlimited.rs deployment)

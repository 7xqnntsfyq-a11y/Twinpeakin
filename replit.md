# TwinPeakingOS v1.3

## Overview

TwinPeakingOS is a privacy-first adaptive dual-personality AI copilot system. The application features two distinct AI personalities ("Core Self" and "Field Alpha") that adapt to user interactions based on MBTI personality assessment. The system automatically classifies user messages to determine which AI personality should respond, creating a context-aware conversational experience.

The application is built as a full-stack TypeScript application with React frontend and Express backend, featuring user authentication, personality profiling through an onboarding questionnaire, and real-time AI chat functionality powered by OpenAI's API (via Replit AI Integrations).

## Recent Changes

**November 19, 2025 - iOS Deployment Setup with Capacitor:**
- Installed Capacitor v7 packages (@capacitor/core, @capacitor/cli, @capacitor/ios, @capacitor/app)
- Created capacitor.config.ts with iOS configuration (appId: com.connorbelanger.twinpeakin)
- Added Capacitor npm scripts: cap:sync, cap:build, cap:open:ios
- Created comprehensive IOS_DEPLOYMENT.md documentation with EAS and local Xcode instructions
- Updated .gitignore to exclude Capacitor build artifacts
- Ready for iOS App Store deployment via Expo Application Services (EAS) or local Xcode builds

**November 19, 2025 - User-Friendly Onboarding Redesign:**
- Completely redesigned onboarding flow with 5 steps: welcome → questions → midway → review → results
- Replaced text areas with beautiful clickable card selectors featuring icons and descriptions
- Added welcome screen explaining dual AI personalities and setting expectations
- Added dimension headers and explanations for each MBTI category (Energy Source, Information Processing, etc.)
- Implemented mid-flow celebration at question 6 with progress summary
- Added review screen allowing users to see and edit all answers before submission
- Enhanced results screen with celebration animation and detailed personality card display
- Improved progress indicators with question count, time estimates, and dimension badges
- Used Framer Motion for smooth animations and transitions throughout

**November 19, 2025 - Stripe Subscription System with Free and Pro Tiers:**
- Added Stripe payment integration via Replit Connector for subscription management
- Database schema already includes Stripe fields (stripeCustomerId, stripeSubscriptionId, subscriptionTier)
- Implemented Free tier (MBTI codes only) and Pro tier ($10.99/month for full Myers-Briggs insights)
- Stripe integration files complete: stripeClient, stripeService, storage, webhookHandlers
- Subscription API endpoints working: /status, /checkout, /portal with feature gating
- Created STRIPE_SETUP.md documentation for product creation and configuration
- Profile endpoint now filters MBTI data based on subscription tier automatically
- Feature gating applied: Free users see type codes only, Pro users get full insights, labels, and archetypes
- Created requirePro middleware for protecting Pro-only endpoints

**November 19, 2025 - ChatGPT-Style Interface & OpenAI Integration:**
- Integrated OpenAI via Replit AI Integrations (using gpt-5 model) with Server-Sent Events (SSE) streaming for real-time chat responses
- Created comprehensive database schema: `conversations`, `messages`, `user_preferences` tables for chat history and analytics
- Built complete ChatGPT-style frontend with collapsible sidebar, conversation list, analytics dashboard (Recharts), and settings panel
- Updated branding to "Twinpeakin - By Connor Belanger" with dark blue/black theme, gradients, and glassmorphism effects
- Implemented all backend API endpoints: conversations CRUD, analytics, preferences, streaming chat with mode classification
- Fixed TypeScript type definitions for Passport.js authentication by creating `server/types/express.d.ts`
- Resolved all LSP errors and confirmed both servers running successfully (frontend: 5000, backend: 3000)
- OpenAI integration verified and ready for testing

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 19 with TypeScript, using functional components and hooks.

**Routing**: Wouter for client-side routing with three main pages:
- LoginPage: Authentication interface
- OnboardingPage: MBTI questionnaire flow
- ChatPage: Dual-mode AI chat interface

**State Management**: 
- React Query (@tanstack/react-query) for server state management
- Local component state with useState/useEffect hooks
- No global state management library (keeping it simple)

**UI Components**: Radix UI primitives for accessible, unstyled components with custom styling via Tailwind CSS. The design system uses CSS custom properties for theming with a dark color scheme.

**Build Tool**: Vite with path aliases (@/ for client, @db/ for server/db)

### Backend Architecture

**Server Framework**: Express.js with TypeScript for REST API endpoints.

**Authentication**: Passport.js with Local Strategy for username/password authentication. Sessions managed with express-session and in-memory store (MemoryStore) for development. Session cookies configured with 7-day expiry.

**Database ORM**: Drizzle ORM with Neon serverless PostgreSQL driver. Schema-first approach with migrations stored in server/db/migrations.

**API Structure**:
- `/api/auth/*` - User registration, login, logout, session management
- `/api/profile/*` - User profile CRUD and onboarding completion
- `/api/chat/*` - Message classification, mode switching, AI conversation
- `/api/health` - Health check endpoint
- `/api/config` - Configuration data (MBTI questions, archetypes)

**Core Services**:

1. **AI Assistant Service** (`services/ai-assistant.ts`): Manages OpenAI chat completions with dual system prompts (Core vs Field personalities). Maintains conversation history per user. Uses Replit AI Integrations for OpenAI API access without requiring user's own API key.

2. **MBTI Detector** (`services/mbti-detector.ts`): Analyzes questionnaire responses to infer both Core (inner self) and Field (outer self) MBTI types through keyword scoring.

3. **Mode Classifier** (`services/mode-classifier.ts`): Determines which AI personality should respond based on message content analysis. Supports manual mode override with expiry.

4. **Telemetry Service** (`services/telemetry.ts`): Privacy-preserving anonymous usage tracking (runtime start counts only).

**Configuration**: Centralized configuration in `server/config/twinpeaking.ts` defining:
- Privacy model guarantees
- Personality archetypes mapped to MBTI types
- Dual-mode behavior rules
- Intent classification signals

### Data Storage

**Database**: PostgreSQL (via Neon serverless), chosen for:
- Relational data modeling (users, profiles, sessions)
- ACID compliance for authentication
- JSON column support for flexible profile data
- Serverless deployment compatibility

**Schema Design**:
- `users` table: Core authentication (id, username, passwordHash, createdAt)
- `user_profiles` table: MBTI results, labels, preferences, onboarding status (references users.id)
- `session` table: Express session storage
- `telemetry` table: Anonymous usage counters

**Session Storage**: In-memory store (MemoryStore) for development. Production would use connect-pg-simple for PostgreSQL-backed sessions (already in dependencies).

### Privacy & Compliance Architecture

**Privacy-by-Design**:
- No chat message text is persisted to database
- No user identifiers beyond authentication username
- No IP addresses, device fingerprints, or metadata collection
- Telemetry limited to anonymous aggregate counters
- Conversation history stored only in-memory per session
- Hard-wired privacy guarantees in configuration (non-optional)

This architecture choice prioritizes user privacy over analytics capabilities, accepting the trade-off of limited conversation persistence.

## External Dependencies

### Third-Party Services

**OpenAI API** (via Replit AI Integrations):
- Purpose: AI chat completions for dual-personality responses
- Integration: Uses environment variables `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`
- Note: Replit AI Integrations provides OpenAI-compatible API without requiring user's own API key

**Neon Database**:
- Purpose: Serverless PostgreSQL hosting
- Integration: Connection via `DATABASE_URL` environment variable
- Driver: @neondatabase/serverless for HTTP-based queries

### Key NPM Packages

**Authentication & Security**:
- `passport` + `passport-local`: Authentication strategy
- `bcrypt`: Password hashing
- `express-session`: Session management

**Database**:
- `drizzle-orm`: TypeScript ORM
- `@neondatabase/serverless`: Neon database driver
- `connect-pg-simple`: PostgreSQL session store (for production)

**UI Framework**:
- `react` + `react-dom`: UI library
- `@radix-ui/*`: Accessible component primitives
- `tailwindcss` + `tailwindcss-animate`: Styling
- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `wouter`: Lightweight routing

**Developer Experience**:
- `vite`: Build tool and dev server
- `typescript`: Type safety
- `tsx`: TypeScript execution for server

### Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: OpenAI API base URL (Replit)
- `AI_INTEGRATIONS_OPENAI_API_KEY`: OpenAI API key (Replit)
- `SESSION_SECRET`: Session encryption key (defaults to development key if not set)
- `NODE_ENV`: Environment flag (affects cookie security settings)
- `PORT`: Server port (defaults to 3000)
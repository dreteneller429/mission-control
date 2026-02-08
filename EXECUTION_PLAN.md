# Mission Control V4 — Execution Plan

## Overview
Complete overhaul of DAVE dashboard into a spaceship-grade Mission Control system. iOS Liquid Glass design throughout. Built with sub-agent delegation and incremental commits.

## Phase Breakdown

### Phase 1: Design System (Sub-Agent)
**Deliverable:** CSS framework, Glass components library, layout system
- Create `/src/styles/` directory
- Build glass.css: All glassmorphism utilities
- Build theme.css: Color palette + variables
- Build layout.css: Grid/flex system
- Build components.css: Reusable button, card, badge, modal styles
- Build animations.css: Transition definitions
- Create `/src/components/` directory with component templates
- Test all glass effects, gradients, shadows
- Commit: feat(design): iOS Liquid Glass design system

### Phase 2: Navigation + Dashboard Page (Sub-Agent)
**Deliverable:** Sidebar nav + main dashboard with 4 stat cards + activity feed + recent commits
- Build Sidebar: DAVE status, nav items, recent docs, user profile
- Build Stat Cards: Status, Workshop, Agents, Documents
- Build Activity Feed: Real-time scrolling with action types/colors
- Build Recent Commits: Git log integration
- Integrate with backend API stubs
- Test navigation, responsive behavior
- Commit: feat(nav): Frosted glass navigation + Dashboard page

### Phase 3: Workshop Page (Sub-Agent)
**Deliverable:** Three-column task queue with auto-pickup, task detail modal, live feed
- Build Queued column: Task cards with priority, tags, progress
- Build Active column: Current task display + auto-pickup logic
- Build Completed column: Finished tasks list
- Build Task Detail Modal: Full task info + activity log
- Build Toggle: Queued/Live Feed view
- Create backend API: GET/POST/PUT/DELETE /workshop/tasks
- Auto-pickup logic: Heartbeat triggers when active is empty
- Test all interactions, modal functionality
- Commit: feat(workshop): Core autonomous work queue

### Phase 4: Agents Page + Comms (Sub-Agent)
**Deliverable:** Personnel tab (agent profiles) + Comms tab (message hub)
- Personnel Tab: Agent profile cards, active tasks, mission directives
- DAVE profile: Pull from SOUL.md, show current task
- Sub-agent profiles: Role labels, status indicators
- Sidebar: Agent list navigation
- Comms Tab: Slack-style message feed, avatar + name + timestamp + message
- Message input: Allow David to send messages
- Integrate with Telegram thread or internal log
- Test profile rendering, message display
- Commit: feat(agents): Personnel profiles + Comms hub

### Phase 5: Intelligence Page (Sub-Agent)
**Deliverable:** Research feed with report list + full report view
- Left Panel: Report list, search/filter by category
- Category colors: Blue (BUSINESS), Teal (PRODUCTIVITY), Purple (RESEARCH), Green (SOURCE), Orange (MARKET)
- Right Panel: Full report with Breakdown, Impact, Strategy sections
- "Deploy Strategy" button: Creates Workshop task
- Backend API: GET/POST/PUT /intelligence endpoints
- Auto-generation: Reports created during research tasks
- Test category filtering, report loading, strategy deployment
- Commit: feat(intelligence): Research intelligence feed

### Phase 6: Cron Jobs + API Usage Pages (Sub-Agent)
**Deliverable:** Cron management page + API usage metrics dashboard
- Cron Jobs Page: List of scheduled tasks, toggle active/paused, edit/delete
- Default jobs: Morning Briefing, Task Summary, Email Check, Dashboard Notes, Weekly SWOT, Weekly Security Audit
- Human-readable schedule display + cron notation
- Next run countdown, last run time
- Backend API: GET/POST/PUT/DELETE /cron
- API Usage Page: Stat cards (Today's Spend, 7-Day, Monthly Projection)
- Charts: Spend history (line), spend distribution (breakdown)
- Intelligence Section: Data Integrity + Efficiency progress bars
- Backend API: GET /api-usage/today, GET /api-usage/history, GET /api-usage/breakdown
- Test UI, data loading
- Commit: feat(cron+api): Scheduled automation + metrics dashboard

### Phase 7: Remaining Pages (Sub-Agent)
**Deliverable:** Journal, Weekly Recaps, Clients, Documents upgrade, DocuDigest
- Journal Page: Date picker, daily log from memory/YYYY-MM-DD.md, prev/next navigation
- Weekly Recaps: Week selector, auto-generated summary (tasks, reports, decisions, issues)
- Clients Page: Client cards grid, details on click, initial client data (Mario, Home Warranty, Tanner, 8-unit, 7-unit, 159-unit)
- Documents Upgrade: Search/filter by tags, categorized list, full preview, delete
- DocuDigest (optional): PDF upload, drag-drop, document processing list
- Test all pages load correctly
- Commit: feat(pages): Journal, Recaps, Clients, Documents, DocuDigest

### Phase 8: Backend API Full Implementation (Sub-Agent)
**Deliverable:** Complete REST API for all features
- Task Management: /workshop/tasks (create, read, update, delete, list)
- Intelligence Reports: /intelligence (create, read, update, list, deploy)
- Cron Jobs: /cron (create, read, update, delete, list)
- API Usage: /api-usage/today, /api-usage/history, /api-usage/breakdown
- Messages/Comms: /comms/messages (send, list, update)
- Agents: /agents (list, get details)
- Documents: /documents (list, get, delete)
- Journal: /journal/:date (get daily entries)
- All endpoints return proper JSON, error handling
- Database: SQLite or JSON file storage
- Commit: feat(api): Complete REST API implementation

### Phase 9: Integration + Data Migration (Sub-Agent)
**Deliverable:** Connect frontend to backend, migrate existing data
- Hook all pages to API endpoints
- Migrate existing tasks/docs into new structure
- Load real git log for Recent Commits
- Load real memory files for Journal
- Auto-generate sample Weekly Recap
- Test full app flow: create task → auto-pickup → complete → view in history
- Commit: feat(integration): Frontend-backend connection + data migration

### Phase 10: Testing + Deployment (Sub-Agent)
**Deliverable:** Comprehensive testing, final deployment
- Unit tests: Components, utilities
- Integration tests: API endpoints, data flow
- E2E tests: Full user workflows (create task → complete → view)
- Test all pages on desktop, tablet, mobile (no complete breakage)
- Fix bugs, optimize performance
- Bundle frontend (React/Vue minified)
- Deploy to production
- Create completion report
- Commit: feat(deploy): Production deployment + testing

## Timeline
- Phases 1-3: ~4 sub-agents, ~2-3 hours each
- Phases 4-7: ~4 sub-agents, ~2-3 hours each
- Phases 8-10: ~3 sub-agents, ~3-4 hours each

**Total estimated:** 25-30 hours of sub-agent work, orchestrated on Haiku

## Validation Checklist (Per Phase)
- [ ] All files created in correct structure
- [ ] No console errors
- [ ] All API endpoints respond correctly
- [ ] Data persists and loads correctly
- [ ] UI matches iOS Liquid Glass design specs
- [ ] Interactive elements work (buttons, modals, toggles, etc.)
- [ ] Responsive on desktop (mobile doesn't need to be perfect)
- [ ] Git commit pushed to GitHub

## Deployment Notes
- Production URL: To be determined after David confirms
- Environment: VPS at 76.13.119.105
- Frontend: Replace existing dashboard at /mission-control/frontend
- Backend: n8n or new Express API at localhost:3000 or different port
- Database: SQLite in /mission-control/data/ or JSON in workspace

---

**Status:** Ready to execute. Awaiting Phase 1 sub-agent dispatch.

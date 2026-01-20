# BeaverDAM Development Backlog

**Last Updated:** January 20, 2026

This backlog tracks future work that's not yet scheduled into a sprint. Items move to `/notes/dev-log/` when they become active sprints.

---

## 📦 Phase 1: Foundation

### ✅ Completed
- **S1:** MCP Server Scaffold (completed January 19, 2026)
  - Basic tools: search_assets, get_asset_url, list_assets
  - Directus API integration
  - Global Claude Code config

### 🚧 In Progress / Next Up
- **S2:** Multi-Tenancy Setup
  - Location: `/notes/dev-log/260120-S2-multi-tenancy-setup.md`
  - Status: Ready to start
  - Creates tenants collection, adds tenant filtering to MCP tools

---

## 📋 Backlog Items

### High Priority (Phase 1)

**npm Package Distribution**
- **Goal:** Publish BeaverDAM MCP server to npm (like HeadVroom)
- **Why:** Easy distribution to Mac Mini and future clients
- **Tasks:**
  - Set up npm account/scope (@beaverdam or @chrisberno)
  - Update package.json with proper metadata
  - Create CHANGELOG.md
  - Publish to npm registry
  - Update Mac Mini's `~/.claude.json` to use npm package
  - Document update process for future versions
- **Depends On:** S2 (multi-tenancy) completion
- **Estimated Time:** 1-2 hours
- **Priority:** High (needed for Mac Mini deployment)

---

### Medium Priority (Phase 2)

**Usage Tracking System**
- **Goal:** Track when/where assets are accessed
- **Why:** Core to Content Graph vision, enables billing/analytics
- **Tasks:**
  - Create `asset_usage` collection in Directus
  - Add usage logging to MCP tools (search, get_asset_url)
  - Create analytics queries (top assets, usage by tenant, etc.)
  - Add MCP tool: `get_asset_analytics`
- **Depends On:** S2 (multi-tenancy) completion
- **Estimated Time:** 2-3 hours
- **Priority:** Medium

**HeadVroom Integration**
- **Goal:** Link BeaverDAM assets to HeadVroom nodes
- **Why:** Content Graph vision - assets as first-class citizens in knowledge network
- **Tasks:**
  - Design asset-to-node linking schema
  - Add HeadVroom node ID field to directus_files
  - Create bidirectional lookup tools
  - Update HeadVroom MCP to show linked assets
  - Usage tracking: "Asset X was served on nodes Y, Z"
- **Depends On:** Usage tracking system
- **Estimated Time:** 4-6 hours
- **Priority:** Medium

**Permission System Enhancement**
- **Goal:** Public/private/request-based asset sharing
- **Why:** Enable controlled sharing across tenants
- **Tasks:**
  - Add permission field to directus_files (public, private, request)
  - Implement RBAC in Directus
  - Add MCP tool: `request_asset_access`
  - Create approval workflow for asset requests
  - Permission inheritance from tenant settings
- **Depends On:** S2 (multi-tenancy) completion
- **Estimated Time:** 3-4 hours
- **Priority:** Medium

---

### Lower Priority (Phase 3+)

**Asset Upload via MCP**
- **Goal:** Upload assets directly from Claude Code
- **Why:** Complete workflow without leaving AI environment
- **Tasks:**
  - Add MCP tool: `upload_asset`
  - Handle base64 encoding for images
  - Automatic Tigris storage upload
  - Metadata extraction (dimensions, file type, etc.)
- **Estimated Time:** 2-3 hours
- **Priority:** Low (Directus UI works fine for now)

**Tenant Management Tools**
- **Goal:** Create/update tenants via MCP
- **Why:** Self-service tenant provisioning
- **Tasks:**
  - Add MCP tool: `create_tenant`
  - Add MCP tool: `update_tenant`
  - Add MCP tool: `archive_tenant`
  - Stripe webhook integration (auto-create tenant on subscription)
- **Depends On:** Stripe integration
- **Estimated Time:** 2-3 hours
- **Priority:** Low (not needed until monetization)

**Folder/Hierarchy System**
- **Goal:** Organize assets in folders within tenants
- **Why:** Better organization for large asset libraries
- **Tasks:**
  - Add folder collection with parent_id (nested sets)
  - Update directus_files with folder_id relationship
  - Add folder browsing to MCP tools
  - Breadcrumb navigation
- **Estimated Time:** 3-4 hours
- **Priority:** Low (flat structure works for MVP)

**Asset Versioning**
- **Goal:** Track asset versions over time
- **Why:** Keep history of logo updates, document revisions
- **Tasks:**
  - Add version_of field to directus_files (self-relation)
  - Version numbering system
  - MCP tool: `get_asset_versions`
  - Restore previous version functionality
- **Estimated Time:** 3-4 hours
- **Priority:** Low (nice-to-have)

**CDN Integration**
- **Goal:** Serve assets via CDN for performance
- **Why:** Faster delivery, global distribution
- **Tasks:**
  - Set up Cloudflare or Fastly
  - Configure domain: assets.beaverdam.cc
  - Update MCP tools to return CDN URLs
  - Cache invalidation strategy
- **Depends On:** Production traffic/need
- **Estimated Time:** 2-3 hours
- **Priority:** Low (Tigris is already globally distributed)

---

## 🚀 Monetization Readiness (Phase 4)

**Stripe Integration**
- **Goal:** Billing for BeaverDAM as SaaS
- **Tasks:**
  - Create Stripe account (admin@beaverdam.cc)
  - Design pricing tiers (Starter, Pro, Enterprise)
  - Implement usage metering (storage, bandwidth, API calls)
  - Webhook: subscription.created → create tenant
  - Webhook: subscription.deleted → archive tenant
  - Customer portal for billing management
- **Depends On:** Multi-tenancy, usage tracking
- **Estimated Time:** 6-8 hours
- **Priority:** Low (not needed until we have customers)

**Marketing Site**
- **Goal:** Public-facing site at beaverdam.cc
- **Tasks:**
  - Design landing page
  - Feature showcase
  - Pricing page
  - Documentation/API reference
  - Sign-up flow
- **Estimated Time:** 8-12 hours
- **Priority:** Low (internal product for now)

---

## 📝 Notes

**Promotion Process:**
When an item is ready to become an active sprint:
1. Create dev log in `/notes/dev-log/YYMMDD-SX-sprint-name.md`
2. Move detailed tasks from backlog to dev log
3. Mark as "In Progress" in backlog.md
4. Move to "Completed" when sprint closes

**Priority Levels:**
- **High:** Needed for core functionality or immediate next step
- **Medium:** Important for vision, but can wait
- **Low:** Nice-to-have, future consideration

---

**Last Updated:** January 20, 2026
**Maintained By:** SPOK / CTO

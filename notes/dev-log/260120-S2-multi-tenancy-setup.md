# Sprint 2: Multi-Tenancy Setup in Directus

**Date:** January 20, 2026
**Sprint:** S2 (Phase 1 - Multi-Tenancy Foundation)
**Status:** Ready to Start
**Estimated Time:** 2-3 hours
**Developer:** CEO + SPOK (or future agent)
**Prerequisites:** Sprint 1 completed successfully

---

## 🎯 What We're Doing

Setting up the **multi-tenant data model** in Directus so that BeaverDAM can isolate assets by tenant (project/client). This is the foundation for the Content Graph vision.

**Why This Matters:**
- Each tenant (Connie, HeadVroom, future clients) gets isolated asset storage
- Enables per-tenant permissions and access control
- Foundation for usage tracking and billing
- Critical for SaaS monetization model

---

## 🏁 Starting Point (What You Have)

✅ **From Sprint 1:**
- BeaverDAM deployed at https://beaverdam.fly.dev/admin
- MCP server working with 3 tools (search_assets, get_asset_url, list_assets)
- 2 test assets in system (claude.jpeg, impotens file)
- Admin credentials: admin@beaverdam.cc / BeaverDAM2026!
- MCP configured globally in `~/.claude.json`

**Current State:**
- Assets exist in flat structure (no tenant organization)
- No `tenants` collection yet
- No tenant filtering in MCP tools

---

## 📦 What We're Building

### **1. Directus Collections**

**a) `tenants` Collection**
- Purpose: Store tenant/project information
- Fields:
  - `id` (UUID, auto-generated)
  - `name` (string, required) - Display name like "Connie" or "HeadVroom"
  - `slug` (string, required, unique) - URL-safe identifier like "connie" or "headvroom"
  - `status` (dropdown: active, inactive, archived)
  - `created_at` (timestamp, auto)
  - `updated_at` (timestamp, auto)

**b) Extend `directus_files` Collection**
- Add field: `tenant_id` (Many-to-One relationship → tenants)
- Optional: Add field: `tenant_folder` (string) - folder path within tenant

**c) `asset_usage` Collection (optional for S2)**
- Track when assets are accessed/used
- Fields: `asset_id`, `accessed_at`, `accessed_by`, `context`

### **2. MCP Server Updates**

**Add Tools:**
- `list_tenants` - Get all tenants
- `create_tenant` - Create new tenant (admin only)

**Update Existing Tools:**
- `search_assets` - Add `tenant` filter parameter
- `list_assets` - Add `tenant` filter parameter
- `get_asset_url` - Include tenant info in response

**Add Resources:**
- `beaverdam://tenants` - List all tenants
- `beaverdam://tenant/{slug}/assets` - Browse assets by tenant

---

## 🛠️ Implementation Steps

### **STEP 1: Create Tenants Collection in Directus (30 min)**

**1.1 Login to Directus**
```
URL: https://beaverdam.fly.dev/admin
Email: admin@beaverdam.cc
Password: BeaverDAM2026!
```

**1.2 Navigate to Settings → Data Model**

**1.3 Click "Create Collection"**
- Collection Name: `tenants`
- Singleton: No (we want multiple tenants)
- Click "Create"

**1.4 Add Fields to Tenants Collection**

Click on `tenants` → Fields tab → New Field

**Field 1: name**
- Type: String
- Interface: Input
- Options:
  - Required: Yes
  - Max Length: 100
- Save

**Field 2: slug**
- Type: String
- Interface: Input
- Options:
  - Required: Yes
  - Max Length: 50
  - Unique: Yes
  - Pattern: `^[a-z0-9-]+$` (lowercase, numbers, hyphens only)
- Save

**Field 3: status**
- Type: String
- Interface: Dropdown
- Options:
  - Choices:
    - `active` (label: Active)
    - `inactive` (label: Inactive)
    - `archived` (label: Archived)
  - Default Value: active
  - Required: Yes
- Save

**Field 4: description**
- Type: Text
- Interface: Textarea
- Options:
  - Rows: 3
- Save

**1.5 Enable Timestamps**
- Click on `tenants` collection
- Settings tab → Accountability
- Enable "Track Created On" → creates `date_created` field
- Enable "Track Updated On" → creates `date_updated` field
- Save

---

### **STEP 2: Create Initial Tenants (15 min)**

**2.1 Navigate to Content → tenants**

**2.2 Click "+ Create Item"**

**Create Tenant 1: Connie**
```
name: Connie
slug: connie
status: active
description: Connie AI assistant project - main tenant for Connie team assets
```
Save → Note the UUID (will need for linking assets)

**Create Tenant 2: HeadVroom**
```
name: HeadVroom
slug: headvroom
status: active
description: HeadVroom knowledge graph platform assets
```
Save → Note the UUID

**Create Tenant 3: BeaverDAM**
```
name: BeaverDAM
slug: beaverdam
status: active
description: BeaverDAM platform assets (logos, docs, etc.)
```
Save → Note the UUID

---

### **STEP 3: Link Existing Assets to Tenants (20 min)**

**3.1 Add tenant_id Field to directus_files**

Navigate to: Settings → Data Model → directus_files

Click "+ New Field"

**Field: tenant_id**
- Type: Many-to-One Relationship
- Related Collection: tenants
- Interface: Select Dropdown
- Options:
  - Display Template: `{{name}} ({{slug}})`
  - Allow None: Yes (for backward compatibility)
- Save

**3.2 Assign Existing Assets to Tenants**

Navigate to: Content → Files

For each file:
1. Click "claude.jpeg"
   - Edit → tenant_id → Select "BeaverDAM (beaverdam)"
   - Save
2. Click "impotens" file
   - Edit → tenant_id → Select "BeaverDAM (beaverdam)" (or appropriate tenant)
   - Save

---

### **STEP 4: Update MCP Server Code (45 min)**

**4.1 Add list_tenants Tool**

Edit: `/mcp/beaverdam-server/src/index.ts`

Add to tools array:
```typescript
{
  name: 'list_tenants',
  description: 'List all tenants in BeaverDAM',
  inputSchema: {
    type: 'object',
    properties: {},
  },
}
```

Add to tool handler:
```typescript
case 'list_tenants': {
  const tenants = await directus.request(
    readItems('tenants', {
      sort: ['name'],
    })
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            total: tenants.length,
            tenants: tenants.map((t: any) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              status: t.status,
              description: t.description,
              createdAt: t.date_created,
            })),
          },
          null,
          2
        ),
      },
    ],
  };
}
```

**4.2 Update search_assets to Support Tenant Filtering**

Update inputSchema:
```typescript
{
  name: 'search_assets',
  description: 'Search for assets in BeaverDAM by query, optionally filtered by tenant',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (searches filename, title, description)',
      },
      tenant: {
        type: 'string',
        description: 'Filter by tenant slug (e.g., "connie", "headvroom")',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10)',
        default: 10,
      },
    },
    required: ['query'],
  },
}
```

Update tool handler to add tenant filter:
```typescript
case 'search_assets': {
  const query = args?.query as string;
  const tenant = args?.tenant as string;
  const limit = (args?.limit as number) || 10;

  if (!query) {
    throw new McpError(ErrorCode.InvalidParams, 'query parameter is required');
  }

  // Build filter
  const filter: any = {};
  if (tenant) {
    // First, find tenant by slug
    const tenants = await directus.request(
      readItems('tenants', {
        filter: { slug: { _eq: tenant } },
        limit: 1,
      })
    );

    if (tenants.length === 0) {
      throw new McpError(ErrorCode.InvalidParams, `Tenant "${tenant}" not found`);
    }

    filter.tenant_id = { _eq: tenants[0].id };
  }

  const files = await directus.request(
    readFiles({
      limit,
      search: query,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      fields: ['*', 'tenant_id.*'], // Include tenant info
    })
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            query,
            tenant: tenant || 'all',
            count: files.length,
            assets: files.map((file: any) => ({
              id: file.id,
              filename: file.filename_download,
              title: file.title,
              type: file.type,
              tenant: file.tenant_id ? {
                name: file.tenant_id.name,
                slug: file.tenant_id.slug,
              } : null,
              url: `${DIRECTUS_URL}/assets/${file.id}`,
              downloadUrl: `${DIRECTUS_URL}/assets/${file.id}?download`,
              size: file.filesize,
              width: file.width,
              height: file.height,
              uploadedOn: file.uploaded_on,
              description: file.description,
              tags: file.tags,
            })),
          },
          null,
          2
        ),
      },
    ],
  };
}
```

**4.3 Update list_assets to Support Tenant Filtering**

Similar pattern - add `tenant` parameter to inputSchema and filter logic.

**4.4 Import readItems from Directus SDK**

At top of file, update imports:
```typescript
import { createDirectus, rest, staticToken, readFiles, readFile, readItems } from '@directus/sdk';
```

---

### **STEP 5: Build and Test (30 min)**

**5.1 Rebuild MCP Server**
```bash
cd /Users/christopherj/projects/BeaverDAM/mcp/beaverdam-server
npm run build
```

**5.2 Verify Server Starts**
```bash
npm run dev
```
Expected: Server starts without errors

**5.3 Check MCP Health**
```bash
claude mcp list
```
Expected: beaverdam shows as "✓ Connected"

**5.4 Test in New Claude Session**

Start new session and test:

```
"Use BeaverDAM MCP to list all tenants"
Expected: Returns Connie, HeadVroom, BeaverDAM

"Search BeaverDAM for 'claude' in tenant 'beaverdam'"
Expected: Returns claude.jpeg with tenant info

"List all assets in the 'connie' tenant"
Expected: Returns only Connie assets (empty if none assigned)
```

---

## ✅ Success Criteria

**All of these must pass:**

1. ✅ `tenants` collection exists in Directus with 3 tenants
2. ✅ `directus_files` has `tenant_id` field
3. ✅ Existing assets assigned to tenants
4. ✅ MCP server builds without errors
5. ✅ `list_tenants` tool returns all 3 tenants
6. ✅ `search_assets` with `tenant` filter works correctly
7. ✅ Assets include tenant information in response
8. ✅ Can filter assets by tenant slug

---

## 📊 Sprint Checklist

- [ ] Step 1: Tenants collection created with all fields
- [ ] Step 2: Initial 3 tenants created (connie, headvroom, beaverdam)
- [ ] Step 3: tenant_id field added to directus_files
- [ ] Step 3: Existing assets linked to tenants
- [ ] Step 4: list_tenants tool implemented
- [ ] Step 4: search_assets updated with tenant filter
- [ ] Step 4: list_assets updated with tenant filter
- [ ] Step 5: MCP server rebuilt successfully
- [ ] Step 5: All tools tested and working

---

## 🚧 Known Issues / Future Work

**Not in Scope for S2:**
- Usage tracking (will need separate collection)
- Permission enforcement (RBAC by tenant)
- Asset upload via MCP
- Folder/hierarchy within tenants
- Tenant creation via MCP tool

**Nice to Have (if time permits):**
- Add `create_tenant` tool
- Add MCP resources (beaverdam://tenants, beaverdam://tenant/{slug}/assets)
- Add tenant filtering to `get_asset_url`

---

## 🔗 Related Documentation

- **S1 Dev Log:** `/notes/dev-log/260119-S1-mcp-server-scaffold-1.md`
- **Technical Specifications:** `/notes/beaverdam-technical-specifications.md`
- **Setup Guide:** `/notes/setup-and-deployment.md`
- **Directus Data Model Docs:** https://docs.directus.io/user-guide/data-model/collections

---

## 💡 Helpful Commands

**Directus Admin:**
```
URL: https://beaverdam.fly.dev/admin
Login: admin@beaverdam.cc / BeaverDAM2026!
```

**MCP Server:**
```bash
# Build
cd /Users/christopherj/projects/BeaverDAM/mcp/beaverdam-server
npm run build

# Test connection
npm test

# Run in dev mode
npm run dev

# Check MCP health
claude mcp list
```

**Testing Flow:**
1. Make changes to src/index.ts
2. Run `npm run build`
3. Start new Claude Code session
4. Test tools

---

## 📝 Sprint Notes

**Pre-Sprint Setup:**
- Make sure you're logged into Directus admin UI
- Have MCP server code open in editor
- Review S1 retrospective for gotchas

**Important Reminders:**
- Always rebuild (`npm run build`) after code changes
- Must start NEW Claude session to pick up MCP changes
- Tenant slugs must be lowercase with hyphens only
- UUID relationships in Directus: use the relational field UI, don't manually enter UUIDs

**Debugging Tips:**
- If MCP server won't connect: check `claude mcp list` for errors
- If tools don't show up: restart Claude Code session entirely
- If Directus errors: check network tab in browser dev tools
- If TypeScript errors: make sure all imports are correct

---

## 📸 Visual Checkpoints

**Checkpoint 1 (After Step 2):**
You should see 3 tenants in Directus Content → tenants view

**Checkpoint 2 (After Step 3):**
Editing a file in Files view should show "Tenant" dropdown with 3 options

**Checkpoint 3 (After Step 5):**
MCP tools should return tenant information:
```json
{
  "tenant": {
    "name": "BeaverDAM",
    "slug": "beaverdam"
  }
}
```

---

**Next Sprint (S3):**
- Usage tracking collection and logging
- HeadVroom integration (link assets to nodes)
- Asset usage analytics
- Permission enforcement patterns

---

## 🚀 Quick Start for Morning

**If you're picking this up fresh, do this:**

1. Open this file first
2. Login to Directus: https://beaverdam.fly.dev/admin
3. Open VS Code to `/mcp/beaverdam-server/src/index.ts`
4. Follow STEP 1 → STEP 5 sequentially
5. Test after each step
6. Update checklist as you go

**Estimated completion: 2-3 hours start to finish**

Good luck! 🦫

# Sprint 1: BeaverDAM MCP Server - Initial Scaffold

**Date:** January 19, 2026
**Sprint:** S1 (Phase 1 - Foundation)
**Status:** ✅ COMPLETE
**Actual Time:** ~3 hours
**Developer:** CEO + SPOK
**Completed:** January 19, 2026 @ 6:30 PM PST

---

## 🎯 What We're Doing

Building the **BeaverDAM MCP Server** - a Model Context Protocol server that exposes BeaverDAM (Directus) assets to AI agents (Claude Code, Claude Desktop, etc.).

This is Phase 1 of the **Content Graph Vision**: Creating the bridge between HeadVroom (knowledge graph) and BeaverDAM (asset storage).

---

## 🤔 Why We're Doing This

**The Problem:**
- We have assets stored in BeaverDAM (Directus)
- We have knowledge nodes in HeadVroom
- No way for AI agents to discover, search, or link these assets naturally
- Current workflow: Manual search in Directus UI → copy URL → paste into node (painful)

**The Vision:**
- Ask AI: "Find the Connie logo"
- AI searches BeaverDAM via MCP
- Returns asset with URL, metadata, permissions
- Eventually: Usage tracking, permission graphs, asset analytics

**Phase 1 Goal:**
Get the basic plumbing working. AI can see and search BeaverDAM assets.

---

## 📦 What We're Building

### **Deliverables:**

1. **MCP Server (`/mcp/beaverdam-server/`)**
   - Node.js + TypeScript MCP server
   - Connects to Directus API at `https://beaverdam.fly.dev`
   - Uses `@modelcontextprotocol/sdk` + `@directus/sdk`

2. **Resources (Read-Only Data)**
   - `beaverdam://tenants` - List all tenants
   - `beaverdam://assets` - List all assets (paginated)

3. **Tools (Actions)**
   - `search_assets` - Search assets by query, tenant, tags
   - `get_asset_url` - Get public/authenticated URL for an asset
   - `list_tenants` - Get all tenants user has access to

4. **Configuration**
   - Environment variables for Directus connection
   - Claude Code config entry to enable the server

---

## 🎬 Expected Outcome

### **When Complete:**

**In Claude Code:**
```
User: "Search BeaverDAM for Connie logo"
Claude: [Uses mcp__beaverdam__search_assets tool]
        Query: "connie logo", tenant: "connie"
        Returns: [
          {
            id: "abc-123",
            title: "Connie Logo Primary",
            url: "https://fly.storage.tigris.dev/beaverdam-assets/...",
            type: "image/svg+xml",
            tenant: "connie",
            tags: ["logo", "brand"]
          }
        ]
```

**In Claude Desktop (Future):**
Same MCP server, works across all Claude apps that support MCP.

---

## ✅ Success Criteria

### **Tests:**

**1. MCP Server Starts**
```bash
cd /Users/christopherj/projects/BeaverDAM/mcp/beaverdam-server
npm start
# Expected: "BeaverDAM MCP Server listening on stdio"
```

**2. Directus Connection Works**
```bash
# Test script: test-connection.js
node test-connection.js
# Expected: "Connected to Directus, found X assets"
```

**3. MCP Tools Are Available**
```bash
# In Claude Code, after adding to config
User: "What MCP tools are available?"
# Expected: See mcp__beaverdam__search_assets, mcp__beaverdam__get_asset_url, etc.
```

**4. Search Works**
```bash
# In Claude Code
User: "Use the BeaverDAM MCP to search for 'logo'"
# Expected: Claude calls the tool and returns results
```

**5. Asset URL Retrieval Works**
```bash
# In Claude Code
User: "Get the URL for asset ID abc-123 from BeaverDAM"
# Expected: Returns authenticated/public URL
```

---

## 🛠️ Implementation Steps

### **Step 1: Project Setup (30 min)**

**1.1 Create Project Structure**
```bash
cd /Users/christopherj/projects/BeaverDAM
mkdir -p mcp/beaverdam-server
cd mcp/beaverdam-server
npm init -y
```

**1.2 Install Dependencies**
```bash
npm install @modelcontextprotocol/sdk @directus/sdk dotenv
npm install -D typescript @types/node tsx
```

**1.3 Initialize TypeScript**
```bash
npx tsc --init
# Configure: target: ES2022, module: NodeNext, moduleResolution: NodeNext
```

**1.4 Create Environment File**
```bash
# .env
DIRECTUS_URL=https://beaverdam.fly.dev
DIRECTUS_TOKEN=<to_be_generated>
```

---

### **Step 2: Generate Directus API Token (15 min)**

**2.1 Create API User in Directus**
- Login to https://beaverdam.fly.dev/admin
- Settings → Access Control → Users
- Create new user: `mcp-service@beaverdam.cc`
- Role: Administrator (or create custom "MCP Service" role)

**2.2 Generate Static Token**
- User Settings → Generate Token
- Copy to `.env` file

**2.3 Test Connection**
```typescript
// test-connection.ts
import { createDirectus, rest, authentication } from '@directus/sdk';

const client = createDirectus(process.env.DIRECTUS_URL!)
  .with(authentication('static', { token: process.env.DIRECTUS_TOKEN! }))
  .with(rest());

async function test() {
  const files = await client.request(readFiles({ limit: 5 }));
  console.log(`Found ${files.length} assets`);
}

test();
```

---

### **Step 3: Scaffold MCP Server (45 min)**

**3.1 Create Main Server File**
```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'beaverdam',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool handlers go here...

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BeaverDAM MCP Server running on stdio');
}

main();
```

**3.2 Implement Tool: list_tenants**
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_tenants',
      description: 'List all tenants in BeaverDAM',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'list_tenants') {
    // Query Directus for tenants
    const tenants = await client.request(readItems('tenants'));
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tenants, null, 2),
        },
      ],
    };
  }
});
```

**3.3 Implement Tool: search_assets**
```typescript
{
  name: 'search_assets',
  description: 'Search for assets in BeaverDAM by query, tenant, or tags',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (searches title, filename, description)',
      },
      tenant: {
        type: 'string',
        description: 'Filter by tenant slug',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by tags',
      },
      limit: {
        type: 'number',
        description: 'Max results to return (default: 10)',
      },
    },
  },
}
```

**3.4 Implement Tool: get_asset_url**
```typescript
{
  name: 'get_asset_url',
  description: 'Get the URL for a specific asset by ID',
  inputSchema: {
    type: 'object',
    properties: {
      assetId: {
        type: 'string',
        description: 'The asset ID (UUID)',
      },
      download: {
        type: 'boolean',
        description: 'Return download URL instead of preview URL',
      },
    },
    required: ['assetId'],
  },
}
```

---

### **Step 4: Add Resources (30 min)**

**4.1 Resource: beaverdam://tenants**
```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'beaverdam://tenants',
      name: 'BeaverDAM Tenants',
      description: 'List of all tenants in the system',
      mimeType: 'application/json',
    },
    {
      uri: 'beaverdam://assets',
      name: 'BeaverDAM Assets',
      description: 'All assets across tenants',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'beaverdam://tenants') {
    const tenants = await client.request(readItems('tenants'));
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(tenants, null, 2),
        },
      ],
    };
  }
});
```

---

### **Step 5: Configure Claude Code (15 min)**

**5.1 Add to Claude Code Config**
```bash
# Edit: ~/.config/claude/claude_desktop_config.json (or Claude Code config)
{
  "mcpServers": {
    "beaverdam": {
      "command": "node",
      "args": ["/Users/christopherj/projects/BeaverDAM/mcp/beaverdam-server/dist/index.js"],
      "env": {
        "DIRECTUS_URL": "https://beaverdam.fly.dev",
        "DIRECTUS_TOKEN": "<your-token>"
      }
    }
  }
}
```

**5.2 Restart Claude Code**
```bash
# Reload window or restart app
```

---

### **Step 6: Test End-to-End (30 min)**

**6.1 Manual Tool Invocation**
```
User: "List all MCP servers"
Expected: See "beaverdam" in the list

User: "Use the BeaverDAM MCP to list tenants"
Expected: Claude calls mcp__beaverdam__list_tenants and shows results
```

**6.2 Resource Access**
```
User: "Read the beaverdam://tenants resource"
Expected: Returns JSON list of tenants
```

**6.3 Search Test**
```
User: "Search BeaverDAM for 'logo'"
Expected: Returns matching assets with URLs
```

---

## 📊 Sprint Checklist

- [x] Step 1: Project setup complete
- [x] Step 2: Directus API token generated and tested
- [x] Step 3: MCP server scaffold complete
  - [x] ~~list_tenants tool working~~ (deferred to S2 - no tenants collection yet)
  - [x] search_assets tool working
  - [x] get_asset_url tool working
  - [x] list_assets tool working (added instead of list_tenants)
- [ ] Step 4: Resources implemented (deferred to S2)
  - [ ] beaverdam://tenants working
  - [ ] beaverdam://assets working
- [x] Step 5: Claude Code configured
- [x] Step 6: End-to-end tests passing
- [x] Documentation updated (README.md in mcp/beaverdam-server/)

---

## 🚧 Known Issues / Future Work

**Not in Scope for S1:**
- Multi-user authentication (using admin token for now)
- Usage tracking (Phase 2)
- Permission enforcement (Phase 2)
- Asset upload via MCP (Phase 2)
- Tenant creation (Phase 2)

**Tech Debt:**
- Error handling is basic (happy path only)
- No caching (direct API calls every time)
- No rate limiting

---

## 🔗 Related Documentation

- **Technical Specifications:** `/notes/beaverdam-technical-specifications.md`
- **Setup Guide:** `/notes/setup-and-deployment.md`
- **P.A.C. Document:** `/notes/PAC-permissions-assets-credentials.md`
- **MCP SDK Docs:** https://modelcontextprotocol.io/docs

---

## 📝 Sprint Notes

**Pre-Sprint Decisions:**
- Using TypeScript (type safety for Directus SDK)
- Using stdio transport (standard for MCP servers)
- Admin token authentication (simplest for MVP)
- No local caching (keep it stateless)

**Post-Sprint Retrospective:**

**✅ What Went Well:**
1. **Fast setup** - TypeScript + MCP SDK worked flawlessly, no issues with dependencies
2. **Directus SDK** - `@directus/sdk` v21 was clean and well-documented
3. **MCP global config** - Found the right config location (`~/.claude.json` mcpServers section)
4. **End-to-end success** - Tools working on first try after fixing config

**🔧 Gotchas & Fixes:**
1. **Static token activation** - Token must be SAVED in Directus UI, not just generated
2. **MCP config location** - Project-level config (created by CLI) needs env vars, had to move to global config
3. **Environment variables** - Must be in the `env` object in config, not picked up from shell
4. **Node.js version** - Using fnm with Node 22 (required for Directus)
5. **TypeScript strictness** - Had to use `DIRECTUS_TOKEN!` assertion for type checking

**💡 Key Learnings:**
1. **MCP Service Account Pattern** - Create dedicated service user (mcp-service@beaverdam.cc) with admin role
2. **Global vs Project Config** - Global config (`~/.claude.json`) > Project config (`.mcp.json`)
3. **Testing Flow** - `npm test` → `npm run build` → `claude mcp list` → test in new session
4. **Credentials Storage** - Keep MCP token in both `.env` file AND `~/.claude/credentials/` for documentation

**🚀 What Worked Great:**
- Building in dev mode with `npm run dev` for rapid iteration
- Using `claude mcp add` CLI command (though had to edit JSON after)
- Storing credentials in `~/.claude/credentials/BEAVERDAM-API-ACCESS.md` for easy reference
- Sprint dev log format - kept us organized and on track

**⚠️ Important Notes for Future Sessions:**
1. **Always restart Claude Code session** after changing `~/.claude.json` MCP config
2. **MCP server path must be absolute** - `/Users/christopherj/projects/...` not `~/projects/...`
3. **Directus at production** - Already deployed and working at https://beaverdam.fly.dev
4. **2 assets in system** - claude.jpeg and impotens file (test data)
5. **No tenants collection yet** - Deferred to S2, using flat asset structure for now

**📦 Deliverables:**
- `/mcp/beaverdam-server/` - Working MCP server (TypeScript)
- `~/.claude.json` - MCP global config with env vars
- `~/.claude/credentials/BEAVERDAM-API-ACCESS.md` - Credentials reference
- `/notes/setup-and-deployment.md` - Full deployment guide
- `/notes/dev-log/260119-S1-mcp-server-scaffold-1.md` - This sprint log

**🎯 Actual vs Estimated Time:**
- Estimated: 2-3 hours
- Actual: ~3 hours (including token troubleshooting)
- Right on target!

---

**Next Sprint (S2):**
- Set up multi-tenancy in Directus (create tenants collection)
- Add tenant filtering to search
- Test with real assets uploaded to Tigris
- Document HeadVroom integration patterns

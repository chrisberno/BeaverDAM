# Sprint S5c: BeaverDAM MCP Tools - Complete The Loop

**Date:** 2026-01-23
**Type:** Infrastructure Sprint
**Status:** ✅ TASKS 1 & 3 COMPLETE (Task 2 deferred)
**Depends On:** S4 (Ship The Wire) - ✅ COMPLETE
**Blocks:** S5b Task 3 (Asset Activation UI)

---

## Time Tracking

| Field | Value |
|-------|-------|
| Start | TBD |
| Stop | TBD |
| **Total** | **TBD** |

## Token Burn

| Category | Input | Output |
|----------|-------|--------|
| TBD | - | - |
| **Combined** | **TBD** | |

---

## Context for New Agent

### The Gap

During S4 we proved both CREATE and CONSUME wires work:
- CREATE: Connie → Doppel API → Voice generated → S3 ✅
- CONSUME: BeaverDAM → Connie → Audio plays ✅

**But there's a gap:** After Doppel creates a file, it's NOT automatically registered in BeaverDAM.

```
Current:  Doppel API → S3 → Doppel DB  (STOPS HERE)
Needed:   Doppel API → S3 → Doppel DB → BeaverDAM  (COMPLETES LOOP)
```

### What is BeaverDAM?

BeaverDAM is a **Directus-based Digital Asset Management** system deployed on Fly.io.

| Without BeaverDAM | With BeaverDAM |
|-------------------|----------------|
| App calls S3 directly | App calls BeaverDAM API |
| No usage tracking | Every access logged |
| No access control | Permissions checked |
| Asset is "loose" | Asset is managed |

**Analogy:** Netflix doesn't let Roku call their S3 directly. They have a distribution layer.

---

## Sprint Goals

Add MCP tools to BeaverDAM so that:
1. External systems (Doppel) can register assets
2. File uploads can happen via MCP
3. Asset consumption is logged

---

## Tasks

### Task 1: `register_asset` MCP Tool (BL10)

**Problem:** No way to register an external URL (S3, etc.) as a managed BeaverDAM asset.

**Solution:** New MCP tool that creates an asset record pointing to external URL.

**API Design:**
```typescript
mcp__beaverdam__register_asset({
  url: "https://doppel-talk.s3.us-east-1.amazonaws.com/tts/xxx.wav",
  title: "CEO Voicemail Greeting",
  description: "Generated from Doppel",
  metadata: {
    source: "doppel",
    project_id: "cmkrhyesb0003kz04m44qt4x5",
    owner_email: "skyracer@mac.com"
  }
})
```

**Returns:**
```json
{
  "asset_id": "uuid-here",
  "status": "registered",
  "access_url": "https://beaverdam.fly.dev/assets/uuid-here"
}
```

**Implementation Location:**
- BeaverDAM MCP server config
- Directus custom endpoint or extension

**Acceptance Criteria:**
- [x] MCP tool available in Claude Code
- [x] Creates asset record in Directus (via importFile)
- [x] Returns asset ID for future reference
- [x] Asset accessible via BeaverDAM API

**Implementation:** Published in `@thebeaverdam/mcp@1.1.0`

---

### Task 2: `upload_asset` MCP Tool (BL11)

**Problem:** Can only register existing URLs; can't upload files directly.

**Solution:** MCP tool that accepts file data and uploads to BeaverDAM storage (Tigris).

**API Design:**
```typescript
mcp__beaverdam__upload_asset({
  filename: "greeting.wav",
  content_type: "audio/wav",
  data: "<base64 or file reference>",
  title: "New Greeting",
  description: "Uploaded via MCP"
})
```

**Implementation Notes:**
- Use Directus Files API
- Storage is Tigris (S3-compatible on Fly.io)
- May need chunked upload for large files

**Acceptance Criteria:**
- [ ] MCP tool accepts file data
- [ ] File stored in Tigris
- [ ] Asset record created in Directus
- [ ] Returns asset ID and access URL

---

### Task 3: `log_access` MCP Tool (BL12)

**Problem:** No way for consuming apps to report usage back to BeaverDAM.

**Solution:** MCP tool that logs asset access events.

**API Design:**
```typescript
mcp__beaverdam__log_access({
  asset_id: "uuid-here",
  consumer: "connie.plus",
  action: "play",
  metadata: {
    user_id: "optional",
    context: "twilio-flex-crm"
  }
})
```

**Implementation Notes:**
- Creates record in access_log table/collection
- Enables usage analytics and billing
- Should be fire-and-forget (non-blocking)

**Acceptance Criteria:**
- [x] MCP tool logs access events
- [x] Events queryable in Directus
- [x] Supports analytics queries

**Implementation:**
- Published in `@thebeaverdam/mcp@1.1.0`
- Created `access_logs` collection in Directus

---

## Credentials & Access

### BeaverDAM (Directus on Fly.io)

**Admin URL:** https://beaverdam.fly.dev/admin

**MCP Service Account Token:** See `notes/PAC-permissions-assets-credentials.md`

**API Base URL:** `https://beaverdam.fly.dev`

### Existing MCP Tools (Reference)

These already exist and work:
- `mcp__beaverdam__list_assets`
- `mcp__beaverdam__search_assets`
- `mcp__beaverdam__get_asset_url`

Check MCP config at: `~/.config/claude-code/` or similar

---

## Codebase Location

| Item | Path |
|------|------|
| BeaverDAM | `/Users/cjberno/projects/chrisberno.dev/dev/beaverdam` |
| MCP Config | Check `mcp.json` or Claude Code settings |
| Directus Extensions | `beaverdam/extensions/` (if exists) |

---

## Architecture Reference

### BeaverDAM Tech Stack

- **Platform:** Directus (headless CMS)
- **Database:** PostgreSQL (on Fly.io)
- **Storage:** Tigris (S3-compatible)
- **Deployment:** Fly.io
- **MCP Integration:** Custom MCP server

### Data Model (Likely)

```
assets
├── id (uuid)
├── title
├── description
├── filename
├── url (external or internal)
├── storage_type (tigris | external)
├── metadata (json)
├── created_at
└── updated_at

access_logs (new - Task 3)
├── id
├── asset_id (fk)
├── consumer
├── action
├── metadata (json)
└── created_at
```

---

## Testing

### Test register_asset

1. Call MCP tool with Doppel S3 URL
2. Verify asset appears in Directus admin
3. Verify asset accessible via `get_asset_url`

### Test Integration with Doppel

After implementing, update Doppel to auto-register:
```
Doppel generates audio → S3 → Doppel DB → call register_asset → BeaverDAM
```

---

## Definition of Done

- [ ] All three MCP tools implemented and working
- [ ] Tools appear in Claude Code tool list
- [ ] Integration tested with real Doppel assets
- [ ] DevLog updated with time/token burn
- [ ] Changes committed and deployed

---

## Related Sprints

| Sprint | Focus | Status |
|--------|-------|--------|
| S4 | Ship The Wire | ✅ COMPLETE |
| S5b | Doppel UI/UX | PLANNED (blocked by Task 1) |
| **S5c** | **BeaverDAM MCP Tools** | **THIS SPRINT** |
| S5d | Doppel Infrastructure | PLANNED |

---

## Notes for CTO Agent

1. **Read S4 DevLog first:** See `260123-dop_S4-ship-the-wire.md`
2. **BeaverDAM is Directus** - Leverage Directus APIs and patterns
3. **MCP server location** - Find and understand existing MCP setup before adding tools
4. **This unblocks S5b** - Asset Activation UI depends on `register_asset`
5. **Start with register_asset** - Most critical, unblocks others

---

*"Complete the loop. Factory → Warehouse → Consumer."*

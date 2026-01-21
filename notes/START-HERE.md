# 🦫 BeaverDAM - Start Here

**Welcome to BeaverDAM!** This is your onboarding guide for new agents or team members.

---

## 📍 Current Status

**Project:** Multi-tenant Digital Asset Management platform
**Phase:** 1 - Foundation
**Current Sprint:** S2 (Multi-Tenancy Setup)
**Last Updated:** January 20, 2026

---

## 🎯 Quick Context: What Is This?

BeaverDAM is the **asset intelligence layer** for the **Content Graph platform**.

- **HeadVroom** = Knowledge graph for organizing projects (thoughts/context)
- **BeaverDAM** = AI-accessible asset storage (files/media)
- **Content Graph** = The integration that unifies them

**Key Insight:** We're NOT competing on storage. We're competing on **asset intelligence** - making files queryable, AI-accessible, and permission-aware.

Read the full vision: [`content-graph-manifesto.md`](./content-graph-manifesto.md)

---

## 📚 Essential Reading (In Order)

### 1️⃣ **Understand the Vision (15 min)**
**Read:** [`content-graph-manifesto.md`](./content-graph-manifesto.md)

This explains:
- Why we're building this
- How HeadVroom + BeaverDAM work together
- Our defensible positioning (not storage wars)
- Business model and growth strategy

### 2️⃣ **Understand the Architecture (30 min)**
**Read:** [`beaverdam-technical-specifications.md`](./beaverdam-technical-specifications.md)

This covers:
- Tech stack (Directus, Fly.io, Tigris, PostgreSQL)
- Multi-tenant architecture
- MCP server design
- API patterns and data model

### 3️⃣ **Get Access (5 min)**
**Read:** [`PAC-permissions-assets-credentials.md`](./PAC-permissions-assets-credentials.md)

This has:
- All passwords and API keys
- Directus admin credentials
- MCP service account token
- Infrastructure access (Fly.io, Tigris)

**Important:** This is the credentials ledger. Keep it updated when credentials change.

### 4️⃣ **Know How to Deploy (10 min)**
**Read:** [`setup-and-deployment.md`](./setup-and-deployment.md)

This includes:
- Deployment commands
- Troubleshooting common issues
- How to reset passwords
- Rollback procedures

---

## 🚀 Starting Your First Sprint

### **Current Sprint: S2 (Multi-Tenancy Setup)**

**Status:** Ready to Start
**Estimated Time:** 2-3 hours
**Prerequisites:** Sprint 1 complete (✅)

**👉 Read:** [`dev-log/260120-S2-multi-tenancy-setup.md`](./dev-log/260120-S2-multi-tenancy-setup.md)

This sprint log has:
- Clear objectives (what we're building)
- Step-by-step instructions (5 phases)
- Success criteria (how to know you're done)
- Checklist (track your progress)

### **How Sprints Work**

1. **Read the dev log** for current sprint
2. **Follow the steps** sequentially
3. **Update the checklist** as you go
4. **Test thoroughly** before marking complete
5. **Add retrospective** when done (what worked, what didn't, gotchas)
6. **Update sprint status** to "✅ COMPLETE"

**Dev log naming pattern:** `YYMMDD-SX-sprint-name.md`
- `260120` = January 20, 2026
- `S2` = Sprint 2
- Keep them in `/notes/dev-log/` directory

---

## 🏗️ Project Structure

```
BeaverDAM/
├── notes/                          ← You are here
│   ├── START-HERE.md              ← This file
│   ├── content-graph-manifesto.md ← Vision/strategy
│   ├── beaverdam-technical-specifications.md
│   ├── PAC-permissions-assets-credentials.md
│   ├── setup-and-deployment.md
│   ├── backlog.md                 ← Future work
│   └── dev-log/                   ← Sprint logs
│       ├── 260119-S1-mcp-server-scaffold-1.md (✅ Complete)
│       └── 260120-S2-multi-tenancy-setup.md (📋 Ready)
│
├── mcp/
│   └── beaverdam-server/          ← MCP server code
│       ├── src/index.ts           ← Main server file
│       ├── dist/                  ← Built JS (run `npm run build`)
│       └── package.json
│
├── directus/
│   ├── Dockerfile                 ← Directus container
│   └── fly.toml                   ← Fly.io deployment config
│
└── assets/                        ← Logo mockups, design files
```

---

## 🔑 Key Resources

### **Production Environment**
- **Directus Admin:** https://beaverdam.fly.dev/admin
- **Login:** admin@beaverdam.cc / BeaverDAM2026!
- **Database:** PostgreSQL on Fly.io (beaverdam-db)
- **Storage:** Tigris (beaverdam-assets bucket)

### **Code Repositories**
- **BeaverDAM:** https://github.com/chrisberno/BeaverDAM (private)
- **HeadVroom:** https://github.com/chrisberno/headvroom (private)

### **Documentation**
- **Notion:** https://www.notion.so/Documentation-2eedae178d5781e1bea3d1e25f802ccc
- **HeadVroom Node:** "🦫 BeaverDAM" in Development graph

### **MCP Server**
- **Location:** `/mcp/beaverdam-server/`
- **Build:** `npm run build`
- **Test:** `npm test`
- **Check Health:** `claude mcp list` (should show "beaverdam ✓ Connected")

---

## 🧭 Navigation Guide

### **If You Want To...**

**Understand the big picture:**
→ Read `content-graph-manifesto.md`

**Understand the tech:**
→ Read `beaverdam-technical-specifications.md`

**Get credentials:**
→ Read `PAC-permissions-assets-credentials.md`

**Deploy or troubleshoot:**
→ Read `setup-and-deployment.md`

**Start working on a sprint:**
→ Read the current sprint in `dev-log/`

**See future work:**
→ Read `backlog.md`

**Add new sprint:**
→ Create new file in `dev-log/` with pattern `YYMMDD-SX-name.md`

---

## 🎯 Sprint Checklist (Quick Reference)

**Before Starting:**
- [ ] Read current sprint dev log completely
- [ ] Check prerequisites are met
- [ ] Have credentials handy (PAC doc)
- [ ] Understand success criteria

**While Working:**
- [ ] Follow steps sequentially
- [ ] Test after each major step
- [ ] Update checklist in dev log as you go
- [ ] Document any issues/gotchas you encounter

**When Finishing:**
- [ ] Verify all success criteria met
- [ ] Run full end-to-end test
- [ ] Add retrospective to dev log
- [ ] Update sprint status to "✅ COMPLETE"
- [ ] Commit all changes to git
- [ ] Update backlog if new work discovered

---

## 💡 Important Principles

### **1. Document Everything**
If you learn something or hit a gotcha, add it to the sprint retrospective. Future agents will thank you.

### **2. Test Before Marking Complete**
"It works on my machine" isn't good enough. Run the full test suite.

### **3. Keep P.A.C. Updated**
When you create/rotate credentials, update the P.A.C. doc immediately.

### **4. Follow Sprint Patterns**
Use the existing dev logs as templates. Consistency helps.

### **5. Commit Often**
Don't wait until the end. Commit after completing each major step.

---

## 🚨 Common Gotchas (From S1)

**MCP Server Issues:**
- Must rebuild (`npm run build`) after code changes
- Must start NEW Claude session to pick up changes
- MCP config must use absolute paths (not `~/projects/...`)
- Environment variables must be in `~/.claude.json` env object

**Directus Issues:**
- Static tokens must be SAVED in UI, not just generated
- Node.js version must be 22 (use fnm: `fnm use 22`)
- Database URL vs individual DB_* vars (Fly.io vs Directus)

**Git Issues:**
- Use heredoc for multi-line commit messages
- Include "🦫 Generated with Claude Code" footer
- Push to remote after commits

---

## 📞 Need Help?

**Stuck on something?**
1. Check the sprint retrospective for similar issues
2. Check `setup-and-deployment.md` for troubleshooting
3. Check Fly.io logs: `flyctl logs --app beaverdam`
4. Check MCP health: `claude mcp list`

**Found a bug?**
1. Document it in current sprint log
2. Add to backlog if not blocking
3. Fix if blocking current sprint

**Want to suggest improvements?**
1. Add to backlog.md with priority level
2. Explain why it's valuable
3. Don't implement unless explicitly approved

---

## 🎉 Ready to Start?

**New agent checklist:**
- [ ] Read this START-HERE doc (you're doing it!)
- [ ] Read Content Graph Manifesto
- [ ] Skim Technical Specifications
- [ ] Bookmark PAC credentials doc
- [ ] Open current sprint dev log
- [ ] Start Sprint 2!

---

## 📝 File Maintenance

**This File Should Be Updated When:**
- Sprint changes (update "Current Sprint" section)
- New major documentation added
- Project structure changes significantly
- Common gotchas discovered

**Keep It:**
- Concise (< 5 min read)
- Actionable (links to detailed docs)
- Current (update dates and status)

---

**Welcome to the team! Let's build something great.** 🦫

---

**Last Updated:** January 20, 2026
**For Questions:** Check sprint logs or PAC doc
**Next Sprint:** S2 - Multi-Tenancy Setup (Ready to start)

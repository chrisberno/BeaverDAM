# BeaverDAM - P.A.C. Documentation
## Permissions, Assets, Credentials

**Last Updated:** January 19, 2026
**Status:** Active Development
**Document Owner:** CEO / SPOK

---

## 📧 EMAIL SETUP

**Primary Email:** `admin@beaverdam.cc`

### Configuration:
- **Service:** EforW (Email Forwarding with Send capability)
- **Account:** Paid ($20/year)
- **Forwards To:** chris@chrisberno.dev
- **Can Send From:** Yes (via EforW SMTP)

### DNS Records (at Spaceship):
```
MX Record:
  Type: MX
  Name: @
  Priority: 10
  Value: mx.eforw.com
  Status: ✅ Active

SPF Record:
  Type: TXT
  Name: @
  Value: v=spf1 include:spf.eforw.com ~all
  Status: ✅ Active
```

### Email Aliases:
- `admin@beaverdam.cc` → chris@chrisberno.dev (service accounts)
- `*@beaverdam.cc` → chris@chrisberno.dev (catch-all)

### Usage:
- Use `admin@beaverdam.cc` for ALL service accounts (Railway, Cloudflare, Stripe, GitHub, etc.)
- Catch-all means support@, billing@, no-reply@ all work automatically

### Access:
- **EforW Dashboard:** https://eforw.com
- **Login Email:** [CEO to fill]
- **Password:** [Stored in password manager]

---

## 🌐 DOMAIN & DNS

**Domain:** `beaverdam.cc`

### Registrar:
- **Service:** Spaceship
- **Account Email:** [CEO to fill]
- **Renewal Date:** [To be filled]
- **Auto-Renew:** [Yes/No - to be confirmed]

### DNS Management:
- **Currently:** Spaceship DNS
- **Future:** May migrate to Cloudflare for R2/CDN integration
- **Dashboard:** https://spaceship.com

### DNS Records Summary:
- MX: Points to EforW (mx.eforw.com)
- TXT (SPF): Authorizes EforW to send
- A/CNAME: [To be added for production Directus instance]

---

## 🔐 SERVICE ACCOUNTS

### Fly.io (Directus Hosting + PostgreSQL)
- **Status:** ✅ Active
- **Account Email:** admin@beaverdam.cc
- **Organization:** Beaver (personal)
- **Purpose:** Host Directus application + PostgreSQL database
- **Dashboard:** https://fly.io/dashboard
- **Cost:** FREE (3 VMs + 3GB storage on free tier)
- **Payment Method:** Business Mastercard ending in 9220
- **Billing:** Usage-based after free tier exceeded
- **CLI Authenticated:** ✅ Yes
- **Credentials:** Authenticated via `flyctl auth login`

### Tigris (S3-Compatible Storage)
- **Status:** ✅ Active
- **Bucket Name:** beaverdam-assets
- **Endpoint:** https://fly.storage.tigris.dev
- **Region:** auto (globally distributed)
- **Purpose:** Asset storage (images, files, media)
- **Dashboard:** Access via Fly.io dashboard
- **Cost:** FREE (5GB storage + 10K PUT + 100K GET requests/mo)
- **Zero Egress Fees:** ✅ Yes
- **Payment Method:** Billed through Fly.io (Business Mastercard ending in 9220)
- **Credentials:** See API Keys section below

### Stripe (Billing & Payments)
- **Status:** Not yet created (Phase 2)
- **Account Email:** admin@beaverdam.cc
- **Purpose:** Customer billing, subscriptions, usage metering
- **Dashboard:** https://dashboard.stripe.com
- **Cost:** 2.9% + $0.30 per transaction
- **Credentials:** [To be added]

### GitHub (Code Repository)
- **Status:** ✅ Active
- **Repository:** https://github.com/chrisberno/BeaverDAM
- **Organization:** Personal account (chrisberno)
- **Purpose:** Source code, version control, CI/CD
- **Visibility:** Public
- **Credentials:** GitHub account (chris@chrisberno.dev)
- **HeadVroom:** Linked in "🦫 Development" graph

---

## 🔑 API KEYS & SECRETS

### Directus
- **Admin User:** admin@beaverdam.cc
- **Admin Password:** BeaverDAM2026!
- **Admin URL:** https://beaverdam.fly.dev/admin
- **Database URL:** postgres://beaverdam:jvFXTxSsDobOnMY@beaverdam-db.flycast:5432/beaverdam

**MCP Service Account:**
- **Email:** mcp-service@beaverdam.cc
- **Role:** Administrator
- **Purpose:** API access for MCP server integration
- **Static Token:** Ew0tb-EvseoLDK3fkreeamxQZlABR8ez

### Tigris Storage (S3-Compatible)
- **Access Key ID:** `tid_ChSEeEFGGTPsBOvzhlDmRJBcNuKQZHREEUGLauqLgCgwrNRtQF`
- **Secret Access Key:** `tsec_UwTW-f-tXj4Onh+psMOKxCiy0p-0mN6kja2jiYZya+oHlyLsbZsos2Cend-mPiYINRG-vR`
- **Bucket Name:** `beaverdam-assets`
- **Endpoint URL:** `https://fly.storage.tigris.dev`
- **Region:** `auto`
- **Usage:** For Directus STORAGE_LOCATIONS configuration

### Stripe
- **Publishable Key:** [To be generated]
- **Secret Key:** [To be generated]
- **Webhook Secret:** [To be generated]
- **Test Mode Keys:** [To be generated]

### MCP Server (BeaverDAM)
- **Code Location:** `/Users/christopherj/projects/BeaverDAM/mcp/beaverdam-server`
- **Built Server:** `/Users/christopherj/projects/BeaverDAM/mcp/beaverdam-server/dist/index.js`
- **Config Location:** `~/.claude.json` (global mcpServers section)
- **Environment:** Loaded from `~/.claude.json` env object:
  - `DIRECTUS_URL`: https://beaverdam.fly.dev
  - `DIRECTUS_TOKEN`: (MCP Service Account token above)
- **Credentials File:** `~/.claude/credentials/BEAVERDAM-API-ACCESS.md`
- **Tools Available:** search_assets, get_asset_url, list_assets

---

## 👥 PERMISSIONS & ACCESS

### System Admin (God Mode)
- **Users:** CEO (Christopher Berno)
- **Access Level:** Full access to all tenants, all features
- **Email:** chris@chrisberno.dev
- **Directus Role:** Administrator

### Internal Tenant Admins
- **Connie Project:** [To be assigned]
- **HeadVroom Project:** [To be assigned]
- **Access Level:** Full access within their tenant only

### Future Customer Admins
- **Access Level:** Full access within their tenant only
- **Provisioned via:** Stripe webhook → automated tenant creation

---

## 📦 IMPORTANT ASSETS

### Technical Documentation
- **Tech Spec:** `/notes/beaverdam-technical-specifications.md`
- **P.A.C. Doc:** `/notes/PAC-permissions-assets-credentials.md` (this file)
- **Repository:** https://github.com/chrisberno/BeaverDAM
- **HeadVroom Graph:** "🦫 Development" (linked to repo)

### Design Assets
- **Logo:** [To be created]
- **Brand Colors:** [To be defined]
- **Marketing Site:** [Future consideration]

### Infrastructure
- **Production URL:** https://dam.beaverdam.cc (proposed)
- **API Endpoint:** https://api.beaverdam.cc (proposed)
- **Asset CDN:** https://assets.beaverdam.cc (proposed)

---

## 🔄 CREDENTIAL ROTATION SCHEDULE

### Immediate (Setup)
- Generate all initial passwords/API keys
- Store in password manager
- Document in this P.A.C. file

### Quarterly
- Review access logs
- Audit active API keys
- Rotate Stripe webhook secrets (if needed)

### Annually
- Rotate all service account passwords
- Review and revoke unused API keys
- Update this documentation

---

## 📝 UPDATE LOG

| Date | Updated By | Changes |
|------|------------|---------|
| 2026-01-19 | SPOK | Initial P.A.C. document created with email setup |
| 2026-01-19 | SPOK | Added Fly.io account (admin@beaverdam.cc, Business MC *9220) |
| 2026-01-19 | SPOK | Added Tigris storage credentials (beaverdam-assets bucket) |
| 2026-01-19 | SPOK | Deployed Directus to production at beaverdam.fly.dev |
| 2026-01-19 | SPOK | Added PostgreSQL database credentials and admin password |
| 2026-01-19 | SPOK | Added MCP service account (mcp-service@beaverdam.cc) with static token |
| 2026-01-19 | SPOK | Added MCP server infrastructure paths and config locations |
| | | |

---

## 🚨 SECURITY NOTES

1. **Never commit credentials to git** - Use environment variables
2. **Use password manager** - 1Password, Bitwarden, or similar
3. **Enable 2FA** - On all service accounts (Railway, Cloudflare, Stripe)
4. **IP Allowlisting** - Consider for production Directus admin access
5. **Rotate secrets** - Follow schedule above
6. **Audit logs** - Review quarterly for suspicious activity

---

## 📞 EMERGENCY CONTACTS

**If service goes down:**
1. Check Railway dashboard for Directus status
2. Check Cloudflare dashboard for R2/CDN status
3. Review error logs in Railway

**If credentials compromised:**
1. Immediately rotate affected API keys
2. Check audit logs for unauthorized access
3. Notify affected customers (if any)
4. Update this P.A.C. document

---

**END OF P.A.C. DOCUMENT**

*This is a living document. Update it whenever credentials change, services are added, or access is granted/revoked.*

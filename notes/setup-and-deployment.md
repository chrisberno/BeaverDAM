# BeaverDAM - Setup & Deployment Guide

**Last Updated:** January 19, 2026
**Status:** Production Deployed
**Deployed URL:** https://beaverdam.fly.dev/admin

---

## 🎯 Quick Overview

BeaverDAM is a multi-tenant Digital Asset Management platform built on Directus, hosted on Fly.io with PostgreSQL and Tigris S3-compatible storage.

**Tech Stack:**
- **Platform:** Directus (latest)
- **Hosting:** Fly.io (San Jose region)
- **Database:** PostgreSQL on Fly.io (1GB volume)
- **Storage:** Tigris (S3-compatible, zero egress fees)
- **Domain:** beaverdam.cc (registered at Spaceship)
- **Email:** admin@beaverdam.cc (via EforW forwarding)

---

## 📁 Project Structure

```
/Users/christopherj/projects/BeaverDAM/
├── directus/
│   ├── Dockerfile              (Directus container definition)
│   └── fly.toml                (Fly.io app configuration)
└── notes/
    ├── beaverdam-technical-specifications.md
    ├── PAC-permissions-assets-credentials.md
    └── setup-and-deployment.md (this file)
```

---

## 🚀 Initial Deployment (Completed)

### 1. Prerequisites Installed
- **Fly.io CLI:** `brew install flyctl`
- **Authenticated:** `flyctl auth login` (as admin@beaverdam.cc)

### 2. Infrastructure Created

**Fly.io App:**
```bash
flyctl launch --name beaverdam --region sjc --no-deploy
# App ID: beaverdam
# Region: San Jose (sjc)
# Organization: Beaver (personal)
```

**PostgreSQL Database:**
```bash
flyctl postgres create --name beaverdam-db --org personal --region sjc \
  --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 1

flyctl postgres attach beaverdam-db --app beaverdam
```

**Database Credentials:**
- Host: `beaverdam-db.flycast`
- Port: `5432`
- User: `beaverdam`
- Password: `jvFXTxSsDobOnMY`
- Database: `beaverdam`

**Tigris Storage Bucket:**
```bash
flyctl storage create --app beaverdam
# Bucket: beaverdam-assets
# Endpoint: https://fly.storage.tigris.dev
# Region: auto
```

### 3. Environment Variables Set

```bash
flyctl secrets set \
  KEY="[generated-key]" \
  SECRET="[generated-secret]" \
  DB_CLIENT="pg" \
  DB_HOST="beaverdam-db.flycast" \
  DB_PORT="5432" \
  DB_USER="beaverdam" \
  DB_PASSWORD="jvFXTxSsDobOnMY" \
  DB_DATABASE="beaverdam" \
  ADMIN_EMAIL="admin@beaverdam.cc" \
  ADMIN_PASSWORD="BeaverDAM2026!" \
  STORAGE_LOCATIONS="tigris" \
  STORAGE_TIGRIS_DRIVER="s3" \
  STORAGE_TIGRIS_KEY="tid_ChSEeEFGGTPsBOvzhlDmRJBcNuKQZHREEUGLauqLgCgwrNRtQF" \
  STORAGE_TIGRIS_SECRET="tsec_UwTW-f-tXj4Onh+psMOKxCiy0p-0mN6kja2jiYZya+oHlyLsbZsos2Cend-mPiYINRG-vR" \
  STORAGE_TIGRIS_BUCKET="beaverdam-assets" \
  STORAGE_TIGRIS_ENDPOINT="https://fly.storage.tigris.dev" \
  STORAGE_TIGRIS_REGION="auto" \
  --app beaverdam
```

### 4. Deployment

```bash
cd /Users/christopherj/projects/BeaverDAM/directus
flyctl deploy
```

**Result:**
- ✅ 2 machines running (auto-scaling)
- ✅ Database initialized and migrated
- ✅ Admin user created
- ✅ Accessible at https://beaverdam.fly.dev/admin

---

## 🔧 Redeployment Process

### Full Redeploy

```bash
cd /Users/christopherj/projects/BeaverDAM/directus
flyctl deploy
```

### Update Environment Variables

```bash
flyctl secrets set KEY="new-value" --app beaverdam
```

### Reset Admin Password

```bash
flyctl ssh console --app beaverdam -C "npx directus users passwd --email admin@beaverdam.cc --password NewPassword123!"
```

### View Logs

```bash
flyctl logs --app beaverdam
```

### SSH into Container

```bash
flyctl ssh console --app beaverdam
```

---

## 🗄️ Database Management

### Connect to PostgreSQL

```bash
flyctl postgres connect --app beaverdam-db
```

### Backup Database

```bash
# Create backup
flyctl postgres backup create --app beaverdam-db

# List backups
flyctl postgres backup list --app beaverdam-db
```

### Run Migrations Manually

```bash
flyctl ssh console --app beaverdam -C "npx directus database migrate:latest"
```

---

## 📦 Tigris Storage Management

**Access via Directus API** (after setting up storage locations in UI)

**Direct S3-Compatible Access:**
```javascript
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: 'https://fly.storage.tigris.dev',
  region: 'auto',
  credentials: {
    accessKeyId: 'tid_ChSEeEFGGTPsBOvzhlDmRJBcNuKQZHREEUGLauqLgCgwrNRtQF',
    secretAccessKey: 'tsec_UwTW-f-tXj4Onh+psMOKxCiy0p-0mN6kja2jiYZya+oHlyLsbZsos2Cend-mPiYINRG-vR'
  }
});
```

---

## 🌐 DNS Configuration (Pending)

To use custom domain `dam.beaverdam.cc`:

1. **Get Fly.io IP addresses:**
```bash
flyctl ips list --app beaverdam
```

2. **Add DNS records at Spaceship:**
```
A Record:
  Name: dam
  Value: [Fly.io IPv4]
  TTL: 300

AAAA Record:
  Name: dam
  Value: [Fly.io IPv6]
  TTL: 300
```

3. **Add certificate to Fly.io:**
```bash
flyctl certs create dam.beaverdam.cc --app beaverdam
```

4. **Update PUBLIC_URL:**
```bash
flyctl secrets set PUBLIC_URL="https://dam.beaverdam.cc" --app beaverdam
```

---

## 🔐 Access Credentials

**Directus Admin:**
- URL: https://beaverdam.fly.dev/admin
- Email: admin@beaverdam.cc
- Password: BeaverDAM2026!

**Fly.io Account:**
- Email: admin@beaverdam.cc
- Organization: Beaver (personal)
- Payment: Business Mastercard ending in 9220

**See full credentials in:** `/notes/PAC-permissions-assets-credentials.md`

---

## 🆘 Troubleshooting

### App Not Responding
```bash
# Check machine status
flyctl status --app beaverdam

# Restart machines
flyctl machine restart --app beaverdam

# Check logs for errors
flyctl logs --app beaverdam
```

### Database Connection Issues
```bash
# Verify database is running
flyctl status --app beaverdam-db

# Test connection
flyctl postgres connect --app beaverdam-db
```

### Storage Issues
- Verify Tigris credentials in Fly.io secrets
- Check Directus Settings → Storage in admin UI
- Ensure bucket `beaverdam-assets` exists

### Login Issues
- Reset password using SSH console (see "Reset Admin Password" above)
- Check ADMIN_EMAIL and ADMIN_PASSWORD secrets match

---

## 📊 Monitoring & Costs

**Free Tier Limits:**
- Fly.io: 3 VMs + 3GB storage (currently using 2 VMs)
- PostgreSQL: 1GB volume
- Tigris: 5GB storage + 10K PUT + 100K GET requests/mo

**Monitor Usage:**
```bash
flyctl dashboard billing
```

---

## 🔄 Scaling

### Add More Machines
```bash
flyctl scale count 3 --app beaverdam
```

### Increase Memory
```bash
flyctl scale memory 2048 --app beaverdam
```

### Increase Database Storage
```bash
flyctl volumes extend --size 5 [volume-id] --app beaverdam-db
```

---

## 📝 Related Documentation

- **Technical Specifications:** `beaverdam-technical-specifications.md`
- **Credentials & Access:** `PAC-permissions-assets-credentials.md`
- **Fly.io Docs:** https://fly.io/docs/
- **Directus Docs:** https://docs.directus.io/
- **Tigris Docs:** https://www.tigrisdata.com/docs/

---

**Questions or Issues?**
Check logs first, then consult the P.A.C. document for credentials and service access.

# BeaverDAM

> **Canonical source of truth:** [BeaverDAM in the Onreb portfolio vault](https://vault.onreb.ai/portfolio/beaverdam/) —
> vision, architecture, and history live there. This repo is **BeaverDAM** ( Multi-tenant Digital Asset Management - AI-accessible asset storage and intelligence layer ).
> **Active sprint:** see the [latest dev-log](https://vault.onreb.ai/portfolio/beaverdam/technical/dev-logs/).

Multi-tenant Digital Asset Management platform — AI-accessible asset storage and the intelligence layer for the Content Graph platform.

## Repo layout

| Dir | What |
|-----|------|
| `directus/` | Directus deployment (Dockerfile + `fly.toml`) for the DAM backend on Fly.io |
| `mcp/` | `@thebeaverdam/mcp` MCP server — AI-agent access to assets (list_tenants, search, list, get_url, register, log_access) |
| `assets/` | Brand and project assets |
| `notes/` | Working notes |

## Stack

Directus · Fly.io · Tigris (S3-compatible object storage) · PostgreSQL · TypeScript · MCP

## Where it runs

- **Admin:** https://beaverdam.fly.dev/admin
- **Domain:** beaverdam.cc
- **Storage:** Tigris (`beaverdam-assets` bucket)

---

Copyright (c) 2026 ONREB.ai. All Rights Reserved. Contains open-source components utilized under their respective licenses, including Directus (BSL 1.1 / Directus license).

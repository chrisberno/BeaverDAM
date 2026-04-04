#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createDirectus, rest, staticToken, readFiles, readFile, readItems, importFile, createItems, updateFile } from '@directus/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://beaverdam.fly.dev';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Directus client
const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

// Create MCP server
const server = new Server(
  {
    name: 'beaverdam',
    version: '1.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: search_assets
// Search for assets in BeaverDAM by query, filename, or description
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_tenants',
        description: 'List all tenants (project namespaces) in BeaverDAM',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'search_assets',
        description: 'Search for assets in BeaverDAM by query. Searches across filename, title, and description. Optionally filter by tenant.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (searches filename, title, description)',
            },
            tenant: {
              type: 'string',
              description: 'Filter by tenant slug (e.g., "connie", "headvroom", "onreb")',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 10)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_asset_url',
        description: 'Get the full URL for a specific asset by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            assetId: {
              type: 'string',
              description: 'The asset ID (UUID)',
            },
            download: {
              type: 'boolean',
              description: 'Get download URL instead of preview URL (default: false)',
              default: false,
            },
          },
          required: ['assetId'],
        },
      },
      {
        name: 'list_assets',
        description: 'List all assets in BeaverDAM with optional pagination and tenant filtering',
        inputSchema: {
          type: 'object',
          properties: {
            tenant: {
              type: 'string',
              description: 'Filter by tenant slug (e.g., "connie", "headvroom", "onreb")',
            },
            limit: {
              type: 'number',
              description: 'Number of assets to return (default: 25)',
              default: 25,
            },
            offset: {
              type: 'number',
              description: 'Number of assets to skip (for pagination)',
              default: 0,
            },
          },
        },
      },
      {
        name: 'register_asset',
        description: 'Register an external URL (e.g., S3) as a managed BeaverDAM asset. Imports the file and creates a tracked asset record.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The external URL of the asset to register (e.g., S3 URL)',
            },
            tenant: {
              type: 'string',
              description: 'Tenant slug to assign the asset to (e.g., "connie", "onreb")',
            },
            title: {
              type: 'string',
              description: 'Title for the asset',
            },
            description: {
              type: 'string',
              description: 'Description of the asset',
            },
            metadata: {
              type: 'object',
              description: 'Custom metadata (source, project_id, owner_email, etc.)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'log_access',
        description: 'Log an asset access event for analytics and usage tracking. Call this when an asset is consumed/played.',
        inputSchema: {
          type: 'object',
          properties: {
            asset_id: {
              type: 'string',
              description: 'The BeaverDAM asset ID that was accessed',
            },
            consumer: {
              type: 'string',
              description: 'The consuming application or service (e.g., connie.plus, twilio-flex)',
            },
            action: {
              type: 'string',
              description: 'The action performed (e.g., play, download, preview)',
              default: 'access',
            },
            metadata: {
              type: 'object',
              description: 'Additional context (user_id, context, etc.)',
            },
          },
          required: ['asset_id', 'consumer'],
        },
      },
    ],
  };
});

// Helper: resolve tenant slug to UUID
async function resolveTenantId(slug: string): Promise<string> {
  const tenants = await directus.request(
    readItems('tenants', {
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  );
  if (!tenants.length) {
    throw new McpError(ErrorCode.InvalidParams, `Tenant "${slug}" not found`);
  }
  return (tenants[0] as any).id;
}

// Helper: format asset with tenant info
function formatAsset(file: any) {
  const tenant = file.tenant_id && typeof file.tenant_id === 'object'
    ? { name: file.tenant_id.name, slug: file.tenant_id.slug }
    : null;
  return {
    id: file.id,
    filename: file.filename_download,
    title: file.title,
    type: file.type,
    tenant,
    url: `${DIRECTUS_URL}/assets/${file.id}`,
    downloadUrl: `${DIRECTUS_URL}/assets/${file.id}?download`,
    size: file.filesize,
    width: file.width,
    height: file.height,
    uploadedOn: file.uploaded_on,
    description: file.description,
    tags: file.tags,
  };
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_tenants': {
        const tenants = await directus.request(
          readItems('tenants', { sort: ['name'] })
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
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'search_assets': {
        const query = args?.query as string;
        const tenant = args?.tenant as string;
        const limit = (args?.limit as number) || 10;

        if (!query) {
          throw new McpError(ErrorCode.InvalidParams, 'query parameter is required');
        }

        // Build filter for tenant
        const filter: any = {};
        if (tenant) {
          const tenantId = await resolveTenantId(tenant);
          filter.tenant_id = { _eq: tenantId };
        }

        // Search across multiple fields
        const files = await directus.request(
          readFiles({
            limit,
            search: query,
            filter: Object.keys(filter).length > 0 ? filter : undefined,
            fields: ['*', { tenant_id: ['name', 'slug'] }],
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
                  assets: files.map(formatAsset),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_asset_url': {
        const assetId = args?.assetId as string;
        const download = (args?.download as boolean) || false;

        if (!assetId) {
          throw new McpError(ErrorCode.InvalidParams, 'assetId parameter is required');
        }

        // Fetch asset details with tenant info
        const file = await directus.request(readFile(assetId, {
          fields: ['*', { tenant_id: ['name', 'slug'] }],
        }));

        const baseUrl = `${DIRECTUS_URL}/assets/${file.id}`;
        const url = download ? `${baseUrl}?download` : baseUrl;
        const tenant = (file as any).tenant_id && typeof (file as any).tenant_id === 'object'
          ? { name: (file as any).tenant_id.name, slug: (file as any).tenant_id.slug }
          : null;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  id: file.id,
                  filename: file.filename_download,
                  title: file.title,
                  type: file.type,
                  tenant,
                  url,
                  downloadUrl: `${baseUrl}?download`,
                  previewUrl: baseUrl,
                  size: file.filesize,
                  width: file.width,
                  height: file.height,
                  uploadedOn: file.uploaded_on,
                  description: file.description,
                  tags: file.tags,
                  metadata: file.metadata,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'list_assets': {
        const tenant = args?.tenant as string;
        const limit = (args?.limit as number) || 25;
        const offset = (args?.offset as number) || 0;

        // Build filter for tenant
        const filter: any = {};
        if (tenant) {
          const tenantId = await resolveTenantId(tenant);
          filter.tenant_id = { _eq: tenantId };
        }

        const files = await directus.request(
          readFiles({
            limit,
            offset,
            filter: Object.keys(filter).length > 0 ? filter : undefined,
            fields: ['*', { tenant_id: ['name', 'slug'] }],
          })
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  total: files.length,
                  offset,
                  limit,
                  tenant: tenant || 'all',
                  assets: files.map(formatAsset),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'register_asset': {
        const url = args?.url as string;
        const tenant = args?.tenant as string;
        const title = args?.title as string;
        const description = args?.description as string;
        const metadata = args?.metadata as Record<string, any>;

        if (!url) {
          throw new McpError(ErrorCode.InvalidParams, 'url parameter is required');
        }

        // Import file from external URL into BeaverDAM
        const fileData: Record<string, any> = {};
        if (title) fileData.title = title;
        if (description) fileData.description = description;

        const importedFile = await directus.request(
          importFile(url, Object.keys(fileData).length > 0 ? fileData : undefined)
        );

        // Update with tenant and/or metadata
        const updateData: Record<string, any> = {};
        if (tenant) {
          updateData.tenant_id = await resolveTenantId(tenant);
        }
        if (metadata) {
          updateData.metadata = metadata;
        }
        if (Object.keys(updateData).length > 0 && importedFile.id) {
          await directus.request(updateFile(importedFile.id, updateData));
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'registered',
                  asset_id: importedFile.id,
                  filename: importedFile.filename_download,
                  title: importedFile.title || title,
                  type: importedFile.type,
                  tenant: tenant || null,
                  access_url: `${DIRECTUS_URL}/assets/${importedFile.id}`,
                  download_url: `${DIRECTUS_URL}/assets/${importedFile.id}?download`,
                  size: importedFile.filesize,
                  source_url: url,
                  metadata: metadata,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'log_access': {
        const asset_id = args?.asset_id as string;
        const consumer = args?.consumer as string;
        const action = (args?.action as string) || 'access';
        const metadata = args?.metadata as Record<string, any>;

        if (!asset_id) {
          throw new McpError(ErrorCode.InvalidParams, 'asset_id parameter is required');
        }
        if (!consumer) {
          throw new McpError(ErrorCode.InvalidParams, 'consumer parameter is required');
        }

        // Create access log entry in the access_logs collection
        // Note: This collection must exist in Directus
        try {
          const logEntry = await directus.request(
            createItems('access_logs', [{
              asset_id: asset_id,
              consumer: consumer,
              action: action,
              metadata: metadata || {},
              accessed_at: new Date().toISOString(),
            }])
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    status: 'logged',
                    log_id: Array.isArray(logEntry) ? logEntry[0]?.id : logEntry,
                    asset_id: asset_id,
                    consumer: consumer,
                    action: action,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          // If access_logs collection doesn't exist, provide helpful error
          if (error.message?.includes('collection') || error.message?.includes('access_logs')) {
            throw new McpError(
              ErrorCode.InternalError,
              'access_logs collection does not exist in Directus. Please create it with fields: asset_id, consumer, action, metadata, accessed_at'
            );
          }
          throw error;
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }

    console.error('Tool execution error:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to execute tool ${name}: ${error.message}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🦫 BeaverDAM MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

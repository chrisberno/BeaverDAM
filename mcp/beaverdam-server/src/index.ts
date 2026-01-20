#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createDirectus, rest, staticToken, readFiles, readFile } from '@directus/sdk';
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
    version: '0.1.0',
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
        name: 'search_assets',
        description: 'Search for assets in BeaverDAM by query. Searches across filename, title, and description.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (searches filename, title, description)',
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
        description: 'List all assets in BeaverDAM with optional pagination',
        inputSchema: {
          type: 'object',
          properties: {
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
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_assets': {
        const query = args?.query as string;
        const limit = (args?.limit as number) || 10;

        if (!query) {
          throw new McpError(ErrorCode.InvalidParams, 'query parameter is required');
        }

        // Search across multiple fields
        const files = await directus.request(
          readFiles({
            limit,
            search: query,
          })
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  query,
                  count: files.length,
                  assets: files.map((file: any) => ({
                    id: file.id,
                    filename: file.filename_download,
                    title: file.title,
                    type: file.type,
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

      case 'get_asset_url': {
        const assetId = args?.assetId as string;
        const download = (args?.download as boolean) || false;

        if (!assetId) {
          throw new McpError(ErrorCode.InvalidParams, 'assetId parameter is required');
        }

        // Fetch asset details
        const file = await directus.request(readFile(assetId));

        const baseUrl = `${DIRECTUS_URL}/assets/${file.id}`;
        const url = download ? `${baseUrl}?download` : baseUrl;

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
        const limit = (args?.limit as number) || 25;
        const offset = (args?.offset as number) || 0;

        const files = await directus.request(
          readFiles({
            limit,
            offset,
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
                  assets: files.map((file: any) => ({
                    id: file.id,
                    filename: file.filename_download,
                    title: file.title,
                    type: file.type,
                    url: `${DIRECTUS_URL}/assets/${file.id}`,
                    size: file.filesize,
                    uploadedOn: file.uploaded_on,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
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

# BeaverDAM MCP Server

MCP (Model Context Protocol) server that exposes BeaverDAM (Directus) assets to AI agents.

## Features

### Read Tools
- **search_assets** - Search for assets by query (searches filename, title, description)
- **get_asset_url** - Get the full URL for a specific asset by ID
- **list_assets** - List all assets with pagination

### Write Tools (S5c)
- **register_asset** - Register an external URL (e.g., S3) as a managed BeaverDAM asset
- **log_access** - Log asset access events for analytics and usage tracking

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
DIRECTUS_URL=https://beaverdam.fly.dev
DIRECTUS_TOKEN=your_mcp_service_token_here
```

### 3. Build

```bash
npm run build
```

### 4. Test Connection

```bash
npm test
```

Expected output:
```
✅ Connected successfully!
📁 Found X files in the system
```

## Configuration

### Claude Code

Add this to your Claude Code MCP servers configuration:

```json
{
  "mcpServers": {
    "beaverdam": {
      "command": "node",
      "args": [
        "/Users/christopherj/projects/BeaverDAM/mcp/beaverdam-server/dist/index.js"
      ],
      "env": {
        "DIRECTUS_URL": "https://beaverdam.fly.dev",
        "DIRECTUS_TOKEN": "your_token_here"
      }
    }
  }
}
```

Then restart Claude Code.

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "beaverdam": {
      "command": "node",
      "args": [
        "/Users/christopherj/projects/BeaverDAM/mcp/beaverdam-server/dist/index.js"
      ],
      "env": {
        "DIRECTUS_URL": "https://beaverdam.fly.dev",
        "DIRECTUS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Usage

Once configured, you can use the BeaverDAM MCP in AI conversations:

### Search for Assets

```
User: "Search BeaverDAM for 'logo'"
AI: [Uses mcp__beaverdam__search_assets tool]
    Returns matching assets with URLs and metadata
```

### Get Asset URL

```
User: "Get the URL for asset abc-123"
AI: [Uses mcp__beaverdam__get_asset_url tool]
    Returns full asset details and URLs
```

### List All Assets

```
User: "List all assets in BeaverDAM"
AI: [Uses mcp__beaverdam__list_assets tool]
    Returns paginated list of assets
```

### Register External Asset (S5c)

```
User: "Register this S3 file in BeaverDAM: https://bucket.s3.amazonaws.com/file.mp3"
AI: [Uses mcp__beaverdam__register_asset tool]
    Imports file and creates managed asset record
    Returns asset_id and access_url
```

Parameters:
- `url` (required): External URL to register
- `title`: Title for the asset
- `description`: Description
- `metadata`: Custom metadata object (source, project_id, owner_email, etc.)

### Log Asset Access (S5c)

```
User: "Log that connie.plus played asset abc-123"
AI: [Uses mcp__beaverdam__log_access tool]
    Creates access log entry for analytics
```

Parameters:
- `asset_id` (required): BeaverDAM asset ID
- `consumer` (required): Consuming app (e.g., "connie.plus")
- `action`: Action performed (default: "access")
- `metadata`: Additional context

## Development

### Run in Dev Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Project Structure

```
beaverdam-server/
├── src/
│   ├── index.ts              # Main MCP server
│   └── test-connection.ts    # Connection test script
├── dist/                      # Compiled JavaScript (generated)
├── .env                       # Environment variables (not in git)
├── .env.example               # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### "Invalid user credentials"

- Verify your `DIRECTUS_TOKEN` is correct in `.env`
- Ensure the MCP Service user exists in Directus with Administrator role
- Check that the token is activated (saved in Directus)

### "Permission denied to access directus_files"

- Ensure the MCP Service user has Administrator role
- Or create a custom role with read access to `directus_files` collection

### MCP server not appearing in Claude Code

- Check the path to `dist/index.js` is correct and absolute
- Restart Claude Code after adding configuration
- Check Claude Code logs for MCP connection errors

## Next Steps

- [ ] Add tenant filtering (multi-tenancy support)
- [ ] Add usage tracking
- [ ] Add permission enforcement
- [ ] Add asset upload capability
- [ ] Add resources (beaverdam://tenants, beaverdam://assets)

## License

MIT

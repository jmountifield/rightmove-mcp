# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides access to Rightmove.co.uk property data. The architecture follows a single-file design pattern:

- **Single Server Class**: `RightmoveMCPServer` handles all MCP protocol operations and implements three main tools
- **Web Scraping Architecture**: Uses axios for HTTP requests and cheerio for HTML parsing of Rightmove's public pages
- **MCP Tool Pattern**: Each tool (search_properties, get_property_details, get_area_statistics) follows the same pattern:
  1. Build request URL with parameters
  2. Fetch HTML with appropriate headers to avoid blocking
  3. Parse DOM with cheerio selectors
  4. Return structured JSON data

## MCP Server Implementation Details

The server implements the Model Context Protocol specification:
- Uses `@modelcontextprotocol/sdk` for MCP communication
- Runs on stdio transport (standard input/output)
- Registers tool handlers for `ListToolsRequestSchema` and `CallToolRequestSchema`
- All tools return data in `{ content: [{ type: "text", text: string }] }` format

## Key Interfaces

- `PropertySearchParams`: Defines search filters (location, price range, property type, etc.)
- `PropertyListing`: Structured property data returned from searches
- Rightmove URL building logic in `buildSearchUrl()` method

## Development Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Run the MCP server (after building)
npm start

# Development with auto-reload
npm run dev

# Lint TypeScript code
npm run lint

# Run tests (Jest framework)
npm test
```

## NPM Package Structure

This project is published as `rightmove-mcp-server` on NPM:
- Binary entry point: `build/index.js` (executable)
- Main export: `build/index.js`
- Users run via: `npx rightmove-mcp-server`
- Pre-publish builds automatically via `prepublishOnly` script

## TypeScript Configuration

- ES2022 target with ESNext modules
- Strict type checking enabled
- Compiles `src/` to `build/` directory
- Generates declaration files and source maps
- Excludes test files from compilation

## Web Scraping Considerations

When modifying scraping logic:
- Rightmove may change their DOM structure, requiring CSS selector updates
- User-Agent headers are set to avoid automated request blocking
- Rate limiting should be considered for production use
- The server scrapes public data only and follows ethical scraping practices

## MCP Client Integration

The server integrates with MCP clients (like Claude Desktop) using:
```json
{
  "mcpServers": {
    "rightmove": {
      "command": "npx",
      "args": ["rightmove-mcp-server"]
    }
  }
}
```
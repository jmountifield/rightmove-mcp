# Rightmove MCP Server

[![npm version](https://badge.fury.io/js/rightmove-mcp-server.svg)](https://www.npmjs.com/package/rightmove-mcp-server)
[![CI/CD Pipeline](https://github.com/jmountifield/rightmove-mcp/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/jmountifield/rightmove-mcp/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for accessing Rightmove.co.uk property data. This server provides tools to search properties, get detailed property information, and retrieve area statistics from the UK's largest property portal.

**✨ Now available on NPM! Use `npx rightmove-mcp-server` to get started instantly.**

## Features

- **Property Search**: Search for properties with various filters (location, price range, property type, bedrooms, etc.)
- **Property Details**: Get detailed information about specific properties including images, descriptions, and agent details
- **Area Statistics**: Retrieve market data and price statistics for specific areas

## Quick Start

### Using NPX (Recommended)

The easiest way to use this MCP server is with npx:

```bash
npx rightmove-mcp-server
```

No installation required! This will automatically download and run the latest version.

### Using with MCP Clients

To use with Claude Desktop or other MCP clients, add this configuration:

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

## Installation for Development

If you want to modify or contribute to this project:

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Running for Development

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### Available Tools

#### 1. search_properties

Search for properties on Rightmove with various filters.

**Parameters:**
- `location` (required): Location to search (e.g., 'London', 'Manchester', 'SW1A 1AA')
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `propertyType`: Type of property ('houses', 'flats', 'bungalows', 'land', 'commercial', 'other')
- `bedrooms`: Number of bedrooms
- `radius`: Search radius in miles
- `sortType`: Sort order (1=highest price, 2=lowest price, 6=newest listed, 10=oldest listed)
- `index`: Starting index for pagination

**Example:**
```json
{
  "location": "London",
  "minPrice": 300000,
  "maxPrice": 500000,
  "propertyType": "flats",
  "bedrooms": 2,
  "radius": 5
}
```

#### 2. get_property_details

Get detailed information about a specific property.

**Parameters:**
- `propertyId` (required): The property ID from Rightmove

**Example:**
```json
{
  "propertyId": "123456789"
}
```

#### 3. get_area_statistics

Get price statistics and market data for an area.

**Parameters:**
- `location` (required): Location to get statistics for

**Example:**
```json
{
  "location": "Shoreditch, London"
}
```

## Configuration

### Alternative MCP Client Configuration

If you've installed the package locally instead of using npx, you can use:

```json
{
  "mcpServers": {
    "rightmove": {
      "command": "node",
      "args": ["/path/to/rightmove-mcp-server/build/index.js"]
    }
  }
}
```

For global npm installation (`npm install -g rightmove-mcp-server`):

```json
{
  "mcpServers": {
    "rightmove": {
      "command": "rightmove-mcp-server"
    }
  }
}
```

### Environment Variables

Currently, no environment variables are required. The server uses web scraping to access publicly available data from Rightmove.

## Important Notes

### Rate Limiting and Ethical Use

- This server uses web scraping to access Rightmove data
- Be respectful of Rightmove's servers and implement appropriate delays between requests
- Consider Rightmove's Terms of Service and robots.txt
- For production use, consider implementing rate limiting and caching

### Data Accuracy

- Property data is scraped from Rightmove's public pages
- Data structure may change if Rightmove updates their website
- Always verify important information directly on Rightmove's website

### Legal Considerations

- This tool is for educational and personal use
- Ensure compliance with Rightmove's Terms of Service
- Do not use for commercial purposes without proper authorization
- Respect copyright and data protection laws

## Development

### Project Structure

```
src/
├── index.ts          # Main server implementation
├── types.ts          # TypeScript type definitions
└── utils.ts          # Utility functions

build/                # Compiled JavaScript output
tests/                # Test files
```

### Building

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Network Errors**: Rightmove may block requests that appear automated. Try:
   - Adding delays between requests
   - Using different User-Agent strings
   - Implementing proxy rotation

2. **Parsing Errors**: If Rightmove changes their HTML structure:
   - Update the CSS selectors in the scraping code
   - Check for changes in their page structure

3. **Rate Limiting**: If you're getting blocked:
   - Reduce request frequency
   - Implement exponential backoff
   - Consider using multiple IP addresses

### Error Handling

The server includes comprehensive error handling and will return error messages when:
- Network requests fail
- HTML parsing encounters issues
- Invalid parameters are provided

## Contributing

This project uses automated CI/CD with semantic versioning. Here's how to contribute:

### Development Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Ensure tests pass: `npm test && npm run build && node final-test.js`
5. Commit with conventional commit format: `feat: add new feature`
6. Submit a pull request

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/) for automatic versioning:

- `feat:` or `minor:` → Minor version bump (new features)
- `fix:` → Patch version bump (bug fixes)  
- `major:` or `breaking:` → Major version bump (breaking changes)
- `docs:`, `style:`, `refactor:`, `test:`, `chore:` → Patch version bump

### Automated Release Process

When you merge a PR to `main`:
1. 🏗️ **Build & Test**: Runs linting, tests, and builds
2. 📦 **Version**: Automatically bumps version based on commit message
3. 🚀 **Publish**: Publishes new version to NPM
4. 🏷️ **Tag**: Creates git tag and GitHub release
5. 📝 **Release Notes**: Auto-generated from commits

### Manual Releases

Maintainers can trigger manual releases via GitHub Actions:
1. Go to **Actions** → **Manual Release**
2. Choose version bump type (major/minor/patch)
3. Add optional release notes
4. Run workflow

## License

MIT License - see LICENSE file for details.

## Disclaimer

This project is not affiliated with Rightmove plc. It is an independent tool that accesses publicly available data from Rightmove.co.uk. Users are responsible for ensuring compliance with Rightmove's Terms of Service and applicable laws.
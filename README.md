# Rightmove MCP Server

A Model Context Protocol (MCP) server for accessing Rightmove.co.uk property data. This server provides tools to search properties, get detailed property information, and retrieve area statistics from the UK's largest property portal.

## Features

- **Property Search**: Search for properties with various filters (location, price range, property type, bedrooms, etc.)
- **Property Details**: Get detailed information about specific properties including images, descriptions, and agent details
- **Area Statistics**: Retrieve market data and price statistics for specific areas

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

Or for development:
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

### MCP Client Configuration

To use this server with an MCP client (like Claude Desktop), add the following to your MCP configuration:

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

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This project is not affiliated with Rightmove plc. It is an independent tool that accesses publicly available data from Rightmove.co.uk. Users are responsible for ensuring compliance with Rightmove's Terms of Service and applicable laws.
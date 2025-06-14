#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as cheerio from "cheerio";
class RightmoveMCPServer {
    server;
    baseUrl = 'https://www.rightmove.co.uk';
    constructor() {
        this.server = new Server({
            name: "rightmove-mcp-server",
            version: "1.0.0",
        });
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "search_properties",
                        description: "Search for properties on Rightmove",
                        inputSchema: {
                            type: "object",
                            properties: {
                                location: {
                                    type: "string",
                                    description: "Location to search (e.g., 'London', 'Manchester', 'SW1A 1AA')"
                                },
                                minPrice: {
                                    type: "number",
                                    description: "Minimum price filter"
                                },
                                maxPrice: {
                                    type: "number",
                                    description: "Maximum price filter"
                                },
                                propertyType: {
                                    type: "string",
                                    enum: ["houses", "flats", "bungalows", "land", "commercial", "other"],
                                    description: "Type of property to search for"
                                },
                                bedrooms: {
                                    type: "number",
                                    description: "Number of bedrooms"
                                },
                                radius: {
                                    type: "number",
                                    description: "Search radius in miles (0.25, 0.5, 1, 3, 5, 10, 15, 20, 30, 40)"
                                },
                                sortType: {
                                    type: "number",
                                    enum: [1, 2, 6, 10],
                                    description: "Sort order: 1=highest price, 2=lowest price, 6=newest listed, 10=oldest listed"
                                },
                                index: {
                                    type: "number",
                                    description: "Starting index for pagination (0, 24, 48, etc.)"
                                }
                            },
                            required: ["location"]
                        }
                    },
                    {
                        name: "get_property_details",
                        description: "Get detailed information about a specific property",
                        inputSchema: {
                            type: "object",
                            properties: {
                                propertyId: {
                                    type: "string",
                                    description: "The property ID from Rightmove"
                                }
                            },
                            required: ["propertyId"]
                        }
                    },
                    {
                        name: "get_area_statistics",
                        description: "Get price statistics and market data for an area",
                        inputSchema: {
                            type: "object",
                            properties: {
                                location: {
                                    type: "string",
                                    description: "Location to get statistics for"
                                }
                            },
                            required: ["location"]
                        }
                    }
                ]
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            switch (request.params.name) {
                case "search_properties":
                    return await this.searchProperties(request.params.arguments);
                case "get_property_details":
                    return await this.getPropertyDetails(request.params.arguments?.propertyId);
                case "get_area_statistics":
                    return await this.getAreaStatistics(request.params.arguments?.location);
                default:
                    throw new Error(`Unknown tool: ${request.params.name}`);
            }
        });
    }
    async searchProperties(params) {
        try {
            const searchUrl = this.buildSearchUrl(params);
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-GB,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
            });
            const $ = cheerio.load(response.data);
            const properties = [];
            $('.l-searchResult').each((index, element) => {
                const $el = $(element);
                const id = $el.find('a').first().attr('href')?.match(/\/property-(\d+)\.html/)?.[1] || '';
                const title = $el.find('.propertyCard-title').text().trim();
                const price = $el.find('.propertyCard-priceValue').text().trim();
                const address = $el.find('.propertyCard-address').text().trim();
                const propertyType = $el.find('.propertyCard-type').text().trim();
                const description = $el.find('.propertyCard-description').text().trim();
                const imageUrl = $el.find('.propertyCard-img img').attr('src') || $el.find('.propertyCard-img img').attr('data-lazy-src');
                const url = this.baseUrl + $el.find('a').first().attr('href');
                const agent = $el.find('.propertyCard-contactsItem-company').text().trim();
                const dateAdded = $el.find('.propertyCard-branchSummary-addedOrReduced span').text().trim();
                // Extract bedroom/bathroom info from description or title
                const bedroomMatch = (title + ' ' + description).match(/(\d+)\s*bed/i);
                const bathroomMatch = (title + ' ' + description).match(/(\d+)\s*bath/i);
                if (id && title) {
                    properties.push({
                        id,
                        title,
                        price,
                        address,
                        bedrooms: bedroomMatch ? parseInt(bedroomMatch[1]) : undefined,
                        bathrooms: bathroomMatch ? parseInt(bathroomMatch[1]) : undefined,
                        propertyType,
                        description,
                        imageUrl,
                        url,
                        agent,
                        dateAdded
                    });
                }
            });
            const totalResults = $('.searchHeader-resultCount').text().trim();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            totalResults,
                            properties,
                            searchParams: params,
                            searchUrl
                        }, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error searching properties: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ],
                isError: true
            };
        }
    }
    async getPropertyDetails(propertyId) {
        try {
            const url = `${this.baseUrl}/properties/${propertyId}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                }
            });
            const $ = cheerio.load(response.data);
            const details = {
                id: propertyId,
                title: $('h1').first().text().trim(),
                price: $('._1gfnqJ3Vtd1z40MlC0MzXu span').first().text().trim(),
                address: $('.WJG_W5-Y4EEYYiG-9-6KJ').text().trim(),
                description: $('#property-description .STw8udCxUaBUMfOOZu0iL._3nPVD8y1gPjYEgMtf6xC2l').text().trim(),
                keyFeatures: [],
                floorplan: $('._2ZNXb7csRmW8bV_GFGUUgK img').attr('src'),
                images: [],
                agent: {
                    name: $('._2E1qBJkWUYMJYHfYJzUb_r').text().trim(),
                    phone: $('a[href^="tel:"]').text().trim(),
                    address: $('._2w3iWfHdXvgf4aKdCEOD-Z').text().trim()
                },
                propertyDetails: {}
            };
            // Extract key features
            $('.lIhZ24u1NjKWbswEMIUYFS li').each((i, el) => {
                details.keyFeatures.push($(el).text().trim());
            });
            // Extract images
            $('._2yl-M5w4_W7_bPcyZsS8aH img').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src)
                    details.images.push(src);
            });
            // Extract property details
            $('._1u12RxIYGO3uXgeJyApCVH').each((i, section) => {
                const $section = $(section);
                const label = $section.find('dt').text().trim();
                const value = $section.find('dd').text().trim();
                if (label && value) {
                    details.propertyDetails[label] = value;
                }
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(details, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching property details: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ],
                isError: true
            };
        }
    }
    async getAreaStatistics(location) {
        try {
            // This would typically hit Rightmove's house prices API endpoint
            // For now, we'll scrape the house prices page
            const encodedLocation = encodeURIComponent(location);
            const url = `${this.baseUrl}/house-prices/${encodedLocation}.html`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
            });
            const $ = cheerio.load(response.data);
            const statistics = {
                location,
                averagePrices: {},
                priceChanges: {},
                salesVolume: '',
                timeOnMarket: '',
                url
            };
            // Extract average prices
            $('.ksc_table-data-cell').each((i, el) => {
                const text = $(el).text().trim();
                const label = $(el).prev('.ksc_table-header-cell').text().trim();
                if (label && text) {
                    statistics.averagePrices[label] = text;
                }
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(statistics, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching area statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ],
                isError: true
            };
        }
    }
    buildSearchUrl(params) {
        const baseUrl = `${this.baseUrl}/find.html`;
        const urlParams = new URLSearchParams();
        if (params.location) {
            urlParams.append('searchLocation', params.location);
        }
        if (params.minPrice) {
            urlParams.append('minPrice', params.minPrice.toString());
        }
        if (params.maxPrice) {
            urlParams.append('maxPrice', params.maxPrice.toString());
        }
        if (params.propertyType) {
            const typeMap = {
                'houses': 'houses',
                'flats': 'flats',
                'bungalows': 'bungalows',
                'land': 'land',
                'commercial': 'commercial',
                'other': 'other'
            };
            urlParams.append('propertyTypes', typeMap[params.propertyType]);
        }
        if (params.bedrooms) {
            urlParams.append('minBedrooms', params.bedrooms.toString());
        }
        if (params.radius) {
            urlParams.append('radius', params.radius.toString());
        }
        if (params.sortType) {
            urlParams.append('sortType', params.sortType.toString());
        }
        if (params.index) {
            urlParams.append('index', params.index.toString());
        }
        return `${baseUrl}?${urlParams.toString()}`;
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Rightmove MCP server running on stdio");
    }
}
const server = new RightmoveMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map
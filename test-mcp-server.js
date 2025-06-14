#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

/**
 * Test harness for the Rightmove MCP server
 * This script sends MCP protocol messages to test server functionality
 */

class MCPTester {
  constructor() {
    this.requestId = 1;
  }

  /**
   * Send an MCP request and get response
   */
  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      // Start the MCP server process
      const serverProcess = spawn('node', ['build/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let responseData = '';
      let errorData = '';

      // Set up response handlers
      serverProcess.stdout.on('data', (data) => {
        responseData += data.toString();
      });

      serverProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      serverProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Server stderr:', errorData);
          reject(new Error(`Server exited with code ${code}`));
          return;
        }

        // Parse the response
        const lines = responseData.trim().split('\n').filter(line => line.trim());
        const responses = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            console.error('Failed to parse line:', line);
            return null;
          }
        }).filter(Boolean);

        resolve(responses);
      });

      // Send the request
      const requestStr = JSON.stringify(request) + '\n';
      serverProcess.stdin.write(requestStr);
      serverProcess.stdin.end();

      // Add timeout
      setTimeout(() => {
        serverProcess.kill();
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }

  /**
   * Test 1: List available tools
   */
  async testListTools() {
    console.log('\n🔧 Testing: List Tools');
    
    const request = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/list",
      params: {}
    };

    try {
      const responses = await this.sendMCPRequest(request);
      console.log('✅ Response received:', JSON.stringify(responses, null, 2));
      
      const toolResponse = responses.find(r => r.id === request.id);
      if (toolResponse && toolResponse.result && toolResponse.result.tools) {
        console.log(`📋 Found ${toolResponse.result.tools.length} tools:`);
        toolResponse.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}: ${tool.description}`);
        });
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  /**
   * Test 2: Search properties in GU9 0LA area
   */
  async testPropertySearch() {
    console.log('\n🏠 Testing: Property Search (GU9 0LA, £1M-£1.1M, 1 mile radius)');
    
    const request = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/call",
      params: {
        name: "search_properties",
        arguments: {
          location: "GU9 0LA",
          minPrice: 1000000,
          maxPrice: 1100000,
          radius: 1
        }
      }
    };

    try {
      const responses = await this.sendMCPRequest(request);
      console.log('✅ Response received');
      
      const toolResponse = responses.find(r => r.id === request.id);
      if (toolResponse && toolResponse.result) {
        const result = JSON.parse(toolResponse.result.content[0].text);
        console.log(`📊 Search Results: ${result.totalResults}`);
        console.log(`🔗 Search URL: ${result.searchUrl}`);
        console.log(`📝 Found ${result.properties.length} properties`);
        
        if (result.properties.length > 0) {
          console.log('\n🏡 Sample Properties:');
          result.properties.slice(0, 3).forEach((prop, idx) => {
            console.log(`   ${idx + 1}. ${prop.title}`);
            console.log(`      Price: ${prop.price}`);
            console.log(`      Address: ${prop.address}`);
            console.log(`      ID: ${prop.id}`);
          });
        }
      } else {
        console.log('❌ No valid response received');
        console.log('Raw responses:', JSON.stringify(responses, null, 2));
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  /**
   * Test 3: Search properties in London
   */
  async testLondonSearch() {
    console.log('\n🏠 Testing: Property Search (London, £300K-£500K, flats, 2 bedrooms)');
    
    const request = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/call",
      params: {
        name: "search_properties",
        arguments: {
          location: "London",
          minPrice: 300000,
          maxPrice: 500000,
          propertyType: "flats",
          bedrooms: 2,
          radius: 5
        }
      }
    };

    try {
      const responses = await this.sendMCPRequest(request);
      console.log('✅ Response received');
      
      const toolResponse = responses.find(r => r.id === request.id);
      if (toolResponse && toolResponse.result) {
        const result = JSON.parse(toolResponse.result.content[0].text);
        console.log(`📊 Search Results: ${result.totalResults}`);
        console.log(`🔗 Search URL: ${result.searchUrl}`);
        console.log(`📝 Found ${result.properties.length} properties`);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  /**
   * Test 4: Get area statistics
   */
  async testAreaStatistics() {
    console.log('\n📈 Testing: Area Statistics (Farnham, Surrey)');
    
    const request = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/call",
      params: {
        name: "get_area_statistics",
        arguments: {
          location: "Farnham, Surrey"
        }
      }
    };

    try {
      const responses = await this.sendMCPRequest(request);
      console.log('✅ Response received');
      
      const toolResponse = responses.find(r => r.id === request.id);
      if (toolResponse && toolResponse.result) {
        const result = JSON.parse(toolResponse.result.content[0].text);
        console.log('📊 Statistics:', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Rightmove MCP Server Tests\n');
    
    // Check if build exists
    try {
      readFileSync('build/index.js');
      console.log('✅ Build file exists');
    } catch (e) {
      console.error('❌ Build file not found. Run: npm run build');
      return;
    }

    await this.testListTools();
    await this.testPropertySearch();
    await this.testLondonSearch();
    await this.testAreaStatistics();
    
    console.log('\n🏁 Tests completed');
  }
}

// Run tests
const tester = new MCPTester();
tester.runAllTests().catch(console.error);
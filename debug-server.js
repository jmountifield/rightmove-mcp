#!/usr/bin/env node

import { spawn } from 'child_process';

/**
 * Debug the MCP server by capturing both stdout and stderr
 */
async function debugSingleRequest() {
  const request = {
    jsonrpc: "2.0",
    id: 1,
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

  console.log('🔍 Debugging property search request...');
  console.log('Request:', JSON.stringify(request, null, 2));

  const serverProcess = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let stdoutData = '';
  let stderrData = '';

  serverProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
    console.log('📤 STDOUT chunk:', data.toString());
  });

  serverProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
    console.log('📥 STDERR chunk:', data.toString());
  });

  serverProcess.on('close', (code) => {
    console.log(`\n🏁 Process exited with code: ${code}`);
    console.log('📤 Full STDOUT:', stdoutData);
    console.log('📥 Full STDERR:', stderrData);
    
    // Try to parse JSON responses
    const lines = stdoutData.trim().split('\n').filter(line => line.trim());
    console.log(`\n📋 Found ${lines.length} output lines:`);
    lines.forEach((line, idx) => {
      console.log(`Line ${idx + 1}:`, line);
      try {
        const parsed = JSON.parse(line);
        console.log(`  ✅ Valid JSON:`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(`  ❌ Invalid JSON:`, e.message);
      }
    });
  });

  // Send the request
  const requestStr = JSON.stringify(request) + '\n';
  console.log('\n📤 Sending request:', requestStr);
  serverProcess.stdin.write(requestStr);
  serverProcess.stdin.end();

  // Wait a bit then kill
  setTimeout(() => {
    serverProcess.kill();
  }, 5000);
}

debugSingleRequest().catch(console.error);
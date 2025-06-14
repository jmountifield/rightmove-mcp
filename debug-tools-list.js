#!/usr/bin/env node

import { spawn } from 'child_process';

async function debugToolsList() {
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  };

  console.log('🔍 Debugging tools/list response...');
  console.log('Request:', JSON.stringify(request, null, 2));

  const serverProcess = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let stdoutData = '';
  let stderrData = '';

  serverProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  serverProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  serverProcess.on('close', (code) => {
    console.log(`\n🏁 Process exited with code: ${code}`);
    console.log('📤 STDOUT:', stdoutData);
    console.log('📥 STDERR:', stderrData);
    
    // Parse the response
    const lines = stdoutData.trim().split('\n').filter(line => line.trim());
    lines.forEach((line, idx) => {
      console.log(`\nLine ${idx + 1}:`, line);
      try {
        const parsed = JSON.parse(line);
        console.log(`✅ Parsed JSON:`, JSON.stringify(parsed, null, 2));
        
        // Check the structure
        if (parsed.result && parsed.result.tools) {
          console.log(`📋 Found ${parsed.result.tools.length} tools`);
          parsed.result.tools.forEach((tool, toolIdx) => {
            console.log(`  Tool ${toolIdx + 1}: ${tool.name} - ${tool.description}`);
          });
        }
      } catch (e) {
        console.log(`❌ Parse error:`, e.message);
      }
    });
  });

  const requestStr = JSON.stringify(request) + '\n';
  serverProcess.stdin.write(requestStr);
  serverProcess.stdin.end();

  setTimeout(() => {
    serverProcess.kill();
  }, 5000);
}

debugToolsList().catch(console.error);
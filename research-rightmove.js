#!/usr/bin/env node

import axios from 'axios';

/**
 * Research Rightmove's actual URL patterns by testing different approaches
 */

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

async function testUrl(description, url) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`🔗 URL: ${url}`);
  
  try {
    const response = await axios.get(url, { headers });
    console.log(`✅ Status: ${response.status}`);
    console.log(`📏 Length: ${response.data.length}`);
    
    // Check for property listings
    const hasProperties = response.data.includes('propertyCard') || 
                         response.data.includes('property-') ||
                         response.data.includes('searchResult');
    
    if (hasProperties) {
      console.log('🏠 Found property content');
    } else {
      console.log('❌ No property content found');
    }

    // Check for error messages
    if (response.data.includes('No properties found') || 
        response.data.includes('0 properties') ||
        response.data.includes('Sorry, we couldn\'t find any properties')) {
      console.log('🔍 Valid search but no results');
    }

    // Check for redirect or error pages
    if (response.data.includes('We can\'t find that page') || 
        response.data.includes('404') ||
        response.data.includes('error')) {
      console.log('❌ Error page detected');
    }

    return response.status === 200;
    
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status} ${error.response?.statusText}`);
    return false;
  }
}

async function researchRightmove() {
  console.log('🔬 Researching Rightmove URL patterns...\n');

  // Test 1: Simple search
  await testUrl(
    'Basic property search',
    'https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=REGION%5EGU9%200LA&radius=1.0&minPrice=1000000&maxPrice=1100000'
  );

  // Test 2: Try without REGION prefix
  await testUrl(
    'Search without REGION prefix',
    'https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=GU9%200LA&radius=1.0&minPrice=1000000&maxPrice=1100000'
  );

  // Test 3: Try with proper postcode formatting
  await testUrl(
    'Search with postcode format',
    'https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=POSTCODE%5EGU9%200LA&radius=1.0&minPrice=1000000&maxPrice=1100000'
  );

  // Test 4: Try with area search
  await testUrl(
    'Search by area name',
    'https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=REGION%5EFarnham&radius=1.0&minPrice=1000000&maxPrice=1100000'
  );

  // Test 5: Minimal working search
  await testUrl(
    'Minimal search parameters',
    'https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=REGION%5ELondon'
  );

  // Test 6: Try the old format we were using
  await testUrl(
    'Old format for comparison',
    'https://www.rightmove.co.uk/find.html?searchLocation=GU9+0LA&minPrice=1000000&maxPrice=1100000&radius=1'
  );

  // Test 7: Manual search to reverse engineer
  console.log('\n💡 To get working URLs:');
  console.log('1. Go to rightmove.co.uk manually');
  console.log('2. Search for properties in GU9 0LA');
  console.log('3. Copy the resulting URL');
  console.log('4. Use that pattern for our implementation');
}

researchRightmove().catch(console.error);
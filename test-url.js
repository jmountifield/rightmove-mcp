#!/usr/bin/env node

import axios from 'axios';

/**
 * Test the URL building and direct HTTP requests to Rightmove
 */

function buildTestUrl(params) {
  const baseUrl = 'https://www.rightmove.co.uk/find.html';
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

async function testRightmoveUrl() {
  const testParams = {
    location: "GU9 0LA",
    minPrice: 1000000,
    maxPrice: 1100000,
    radius: 1
  };

  const url = buildTestUrl(testParams);
  console.log('🔗 Generated URL:', url);

  // Test with proper headers
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  try {
    console.log('\n🌐 Testing direct HTTP request...');
    const response = await axios.get(url, { headers });
    console.log('✅ Status:', response.status);
    console.log('📏 Response length:', response.data.length);
    
    // Check if we got redirected or got an error page
    if (response.data.includes('We can\'t find that page') || response.data.includes('404')) {
      console.log('❌ Got 404 page content');
    } else if (response.data.includes('rightmove')) {
      console.log('✅ Got Rightmove page content');
    }

    // Look for property listings
    if (response.data.includes('propertyCard') || response.data.includes('searchResult')) {
      console.log('🏠 Found property listing elements');
    } else {
      console.log('❌ No property listing elements found');
    }

  } catch (error) {
    console.error('❌ HTTP Error:', error.response?.status, error.response?.statusText);
    console.error('❌ Error message:', error.message);
  }

  // Test a known working URL format
  console.log('\n🧪 Testing known Rightmove URL pattern...');
  const knownUrl = 'https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=POSTCODE%5E1633674&insId=1&radius=1.0&minPrice=1000000&maxPrice=1100000&sortType=2&index=0&propertyTypes=&includeSSTC=false&mustHave=&dontShow=&furnishTypes=&keywords=';
  
  try {
    const response2 = await axios.get(knownUrl, { headers });
    console.log('✅ Known URL Status:', response2.status);
    console.log('📏 Known URL Response length:', response2.data.length);
  } catch (error) {
    console.error('❌ Known URL Error:', error.response?.status, error.response?.statusText);
  }
}

testRightmoveUrl().catch(console.error);
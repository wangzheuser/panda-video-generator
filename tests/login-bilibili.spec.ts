import { test } from '@playwright/test';
import path from 'path';
import { mkdirSync } from 'fs';

/**
 * Login script for Bilibili
 * Run this ONCE to login and save your session
 * After login, your session will be saved and reused in other tests
 * 
 * Usage: pnpm test:login
 */

const authFile = path.join(__dirname, '../playwright/.auth/bilibili.json');

test('login to bilibili - run this once to save login state', async ({ page, context }) => {
  console.log('🌐 Opening Bilibili...');
  await page.goto('https://www.bilibili.com/');
  
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Wait for dynamic content
  
  // Check if already logged in
  console.log('🔍 Checking login status...');
  
  // Try multiple selectors to detect login status
  const loginIndicators = [
    page.locator('.header-avatar-wrap'), // User avatar
    page.locator('[class*="avatar"]').first(),
    page.locator('text=个人中心').first(),
    page.locator('.header-user-info'),
  ];
  
  let isLoggedIn = false;
  for (const indicator of loginIndicators) {
    try {
      const visible = await indicator.isVisible({ timeout: 2000 });
      if (visible) {
        isLoggedIn = true;
        console.log('✅ Already logged in! Saving session...');
        break;
      }
    } catch (e) {
      // Continue checking other indicators
    }
  }
  
  if (!isLoggedIn) {
    console.log('🔐 Not logged in. Please login manually...');
    console.log('⏸️  Playwright Inspector will pause - login and then click Resume');
    
    // Pause and wait for user to login manually
    await page.pause();
    
    // After resume, check login status again
    console.log('🔍 Checking login status after resume...');
    await page.waitForTimeout(2000);
    
    // Verify login
    let verified = false;
    for (const indicator of loginIndicators) {
      try {
        const visible = await indicator.isVisible({ timeout: 5000 });
        if (visible) {
          verified = true;
          console.log('✅ Login verified! Saving session...');
          break;
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (!verified) {
      console.log('⚠️  Login not detected. Please ensure you are logged in.');
      await page.waitForTimeout(5000);
    }
  }
  
  // Save authentication state
  console.log('💾 Saving authentication state...');
  
  // Ensure directory exists
  const authDir = path.dirname(authFile);
  mkdirSync(authDir, { recursive: true });
  
  // Save storage state (cookies, localStorage, etc.)
  await context.storageState({ path: authFile });
  
  console.log(`✅ Authentication state saved to: ${authFile}`);
  console.log('📝 You can now run other tests and they will use this saved session.');
});

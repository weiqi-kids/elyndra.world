import { test, expect } from '@playwright/test';

test.describe('Chat Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the sidebar', async ({ page }) => {
    // Check if sidebar is visible on desktop
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('should display chat list', async ({ page }) => {
    // Check if chat list is rendered
    const chatList = page.locator('[data-testid="chat-list"]');
    await expect(chatList).toBeVisible();
  });

  test('should allow searching conversations', async ({ page }) => {
    // Find and interact with search input
    const searchInput = page.getByPlaceholder(/搜尋|search/i);
    await searchInput.fill('Magic');

    // Verify search filters results
    await expect(page.getByText('Magic Club')).toBeVisible();
  });

  test('should open a conversation when clicked', async ({ page }) => {
    // Click on a conversation
    await page.getByText('Magic Club').click();

    // Verify chat content area is displayed
    const chatContent = page.locator('[data-testid="chat-content"]');
    await expect(chatContent).toBeVisible();
  });

  test('should have message input area', async ({ page }) => {
    // Navigate to a chat
    await page.getByText('Magic Club').click();

    // Check for message input
    const messageInput = page.getByPlaceholder(/輸入訊息|message/i);
    await expect(messageInput).toBeVisible();
  });

  test('should toggle sidebar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Find and click menu button
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();

    // Verify drawer opens
    const drawer = page.locator('[data-testid="mobile-drawer"]');
    await expect(drawer).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to Campus Announcements
    await page.getByText(/公告|announcements/i).click();
    await expect(page).toHaveURL(/announcements/);

    // Navigate back to Chat
    await page.getByText(/聊天|chat/i).click();
    await expect(page).toHaveURL(/chat|\/$/);
  });
});

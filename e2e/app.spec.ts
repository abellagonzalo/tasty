import { test, expect } from '@playwright/test';

/**
 * Hello World E2E Test
 *
 * This test verifies that:
 * 1. The backend server starts successfully
 * 2. The frontend application loads
 * 3. The main page renders with expected content
 */
test.describe('Tasty Application', () => {
  test('should load the application homepage', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the main heading to be visible
    const heading = page.getByRole('heading', { name: 'Options Positions', level: 1 });
    await expect(heading).toBeVisible();

    // Verify the page title or other key elements are present
    await expect(page).toHaveTitle(/Tasty Options Tracker/);

    // Verify key sections are present
    await expect(page.getByText('Import IBKR Trades')).toBeVisible();
    await expect(page.getByText('Add Position Manually')).toBeVisible();
    await expect(page.getByText('Current Positions')).toBeVisible();
  });

  test('should verify backend is responding', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // The fact that the page loaded means the backend API is working
    // (since the frontend makes a call to load positions on mount)
    const heading = page.getByRole('heading', { name: 'Options Positions' });
    await expect(heading).toBeVisible();

    // Verify the page loaded without errors
    const errorMessages = page.getByText(/Failed to load positions/i);
    await expect(errorMessages).not.toBeVisible();
  });
});

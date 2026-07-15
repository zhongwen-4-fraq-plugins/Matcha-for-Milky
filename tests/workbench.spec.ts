import { expect, test } from '@playwright/test';

test('operates the browser preview and keeps the desktop layout stable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await expect(page.getByPlaceholder('搜索')).toBeVisible();
  await expect(page.getByRole('heading', { name: '群聊测试' })).toBeVisible();
  await page.getByRole('button', { name: /Milky 模拟服务/ }).click();
  await expect(page.getByRole('heading', { name: 'Milky 模拟服务' })).toBeVisible();
  await expect(page.locator('.endpoint-preview')).toContainText('http://127.0.0.1:30001');
  await page.getByRole('button', { name: /群聊测试/ }).click();
  await page.getByTitle('关于').click();
  await expect(page.getByRole('heading', { name: 'Fraq Debug' })).toBeVisible();
  await expect(page.getByText('Milky 1.2.2')).toBeVisible();
  await page.screenshot({ path: 'test-results/about-desktop.png', fullPage: true });
  await page.getByRole('button', { name: /群聊测试/ }).click();
  await page.getByRole('button', { name: '启动', exact: true }).click();
  await expect(page.getByRole('button', { name: '停止', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await expect(page.locator('.chat-content p').filter({ hasText: 'echo Hello Fraq' })).toBeVisible();
  await page.screenshot({ path: 'test-results/workbench-desktop.png', fullPage: true });
});

test('fits the narrow layout without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '群聊测试' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await page.screenshot({ path: 'test-results/workbench-mobile.png', fullPage: true });
});

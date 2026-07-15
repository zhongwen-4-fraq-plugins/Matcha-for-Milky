import { expect, test } from '@playwright/test';

test('operates the browser preview and keeps the desktop layout stable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '插件测试工作台' })).toBeVisible();
  await expect(page.getByText('http://127.0.0.1:30001')).toBeVisible();
  await page.getByRole('button', { name: '启动服务' }).click();
  await expect(page.getByText('运行中', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '注入事件' }).click();
  await page.getByRole('button', { name: /活动日志/ }).click();
  await expect(page.getByText('已注入 group 消息：echo Hello Fraq')).toBeVisible();
  await page.screenshot({ path: 'test-results/workbench-desktop.png', fullPage: true });
});

test('fits the narrow layout without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '插件测试工作台' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await page.screenshot({ path: 'test-results/workbench-mobile.png', fullPage: true });
});

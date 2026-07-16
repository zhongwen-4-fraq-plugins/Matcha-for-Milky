import { expect, test } from '@playwright/test';

test('operates the browser preview and keeps the desktop layout stable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await expect(page.getByPlaceholder('搜索')).toBeVisible();
  await expect(page.getByRole('heading', { name: '群聊测试' })).toBeVisible();
  await expect(page.locator('.app-rail nav button').evaluateAll((buttons) => buttons.map((button) => button.title))).resolves.toEqual([
    '消息列表',
    '插件管理',
    '群聊列表',
    '好友列表',
    '活动日志',
  ]);
  await page.getByTitle('添加').click();
  await expect(page.getByRole('button', { name: '添加群聊', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '添加账号', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/add-menu-desktop.png', fullPage: true });
  await page.getByRole('button', { name: '添加群聊', exact: true }).click();
  const groupDialog = page.getByRole('dialog', { name: '添加群聊' });
  await groupDialog.getByLabel('群号').fill('777888');
  await groupDialog.getByLabel('群名称').fill('新增测试群');
  await groupDialog.getByRole('button', { name: '添加', exact: true }).click();
  await expect(page.getByRole('heading', { name: '新增测试群', level: 1 })).toBeVisible();
  await page.getByTitle('添加').click();
  await page.getByRole('button', { name: '添加账号', exact: true }).click();
  const friendDialog = page.getByRole('dialog', { name: '添加账号' });
  await friendDialog.getByLabel('QQ').fill('10010');
  await friendDialog.getByLabel('昵称').fill('Dave');
  await friendDialog.getByLabel('备注').fill('新增账号');
  await friendDialog.getByRole('button', { name: '添加', exact: true }).click();
  await expect(page.getByRole('heading', { name: '新增账号', level: 1 })).toBeVisible();
  await page.getByTitle('插件管理').click();
  await expect(page.getByRole('heading', { name: '插件管理' })).toBeVisible();
  await page.getByPlaceholder('插件目录或入口文件').fill('D:\\bot\\sample-plugin');
  await page.locator('.plugin-manager').getByRole('button', { name: '添加', exact: true }).click();
  await expect(page.getByText('sample-plugin', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/plugin-manager-desktop.png', fullPage: true });
  await page.getByTitle('群聊列表').click();
  await expect(page.getByRole('heading', { name: '新增测试群', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: /Milky 协议交流群/ }).click();
  await expect(page.getByRole('heading', { name: 'Milky 协议交流群', level: 1 })).toBeVisible();
  await page.screenshot({ path: 'test-results/group-list-desktop.png', fullPage: true });
  await page.getByRole('button', { name: '开始消息测试', exact: true }).click();
  await expect(page.getByText('group · 654321')).toBeVisible();
  await page.getByTitle('好友列表').click();
  await expect(page.getByRole('heading', { name: '新增账号', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: /图像插件作者/ }).click();
  await expect(page.getByRole('heading', { name: '图像插件作者', level: 1 })).toBeVisible();
  await page.screenshot({ path: 'test-results/friend-list-desktop.png', fullPage: true });
  await page.getByRole('button', { name: '开始消息测试', exact: true }).click();
  await expect(page.getByText('friend · 10003')).toBeVisible();
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

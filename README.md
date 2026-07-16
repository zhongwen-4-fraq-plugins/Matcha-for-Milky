<p align="center">
  <a href="https://github.com/A-kirami/matcha">
    <br />
    <img src="./public/matcha.webp" alt="Matcha Logo" width="200" />
    <br />
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./public/matcha-text-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="./public/matcha-text-light.svg">
      <img src="./public/matcha-text-light.svg" alt="Matcha Text" width="200" />
    </picture>
  </a>
  <br />
  模拟聊天交互的辅助开发工具
</p>

<p align="center">
  <a href="https://github.com/A-kirami/matcha/actions/workflows/build.yml" target="__blank"
    ><img src="https://github.com/A-kirami/matcha/actions/workflows/build.yml/badge.svg?branch=main&event=push" alt="Github Actions"
  /></a>
  <a href="https://app.codacy.com/gh/A-kirami/matcha/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade" target="__blank"
    ><img src="https://app.codacy.com/project/badge/Grade/99e8f33bae854311a67ccf671a015d9a" alt="Codacy"
  /></a>
  <br />
  <a href="https://github.com/A-kirami/matcha/releases/latest" target="__blank"
    ><img src="https://img.shields.io/github/v/release/A-kirami/matcha?include_prereleases&&color=70aeff&style=social" alt="Release Version"
  /></a>
  <a href="https://github.com/A-kirami/matcha/stargazers" target="__blank"
    ><img alt="GitHub stars" src="https://img.shields.io/github/stars/A-kirami/matcha?style=social"
  /></a>
  <a href="https://github.com/A-kirami/matcha/releases" target="__blank"
    ><img alt="GitHub downloads" src="https://img.shields.io/github/downloads/A-kirami/matcha/total?style=social"
  /></a>
  <br />
  <a href="#" target="__blank">
    <strong>🌎 演示与预览</strong>
  </a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/A-kirami/matcha/releases" target="__blank">
    <strong>📦️ 下载安装包</strong>
  </a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://jq.qq.com/?_wv=1027&k=SBsy6Rrn" target="__blank">
    <strong>💬 加入交流群</strong>
  </a>
</p>

<p align="center">
  <a href="https://github.com/A-kirami/matcha" target="__blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./docs/preview-dark.webp">
      <source media="(prefers-color-scheme: light)" srcset="./docs/preview-light.webp">
      <img src="./docs/preview-light.webp" alt="Matcha - Preview" width="100%" />
    </picture>
  </a>
</p>

Matcha is mock chat.

Matcha 是一个专为 [KiramiBot](https://github.com/A-kirami/KiramiBot) 设计的辅助开发工具，能够与 KiramiBot 进行模拟聊天交互，同时提供一系列的开发辅助功能。

它旨在降低开发者的调试与测试的负担，从而更有效率的专注于功能开发。

尽管它主要为 KiramiBot 设计，但只要是符合 Matcha 支持协议的机器人，都可接入并能够使用大部分基础功能。

> [KiramiBot](https://github.com/A-kirami/KiramiBot) 是一个简明轻快的聊天机器人应用，它与 [NoneBot2](https://github.com/nonebot/nonebot2) 完全兼容，同时提供了更多的功能与特性，欢迎体验！

## Fraq 与 Milky

本仓库基于 Matcha 0.4.8 开发，增加了 [Milky](https://milky.ntqqrev.org/) 1.2 协议端，可直接连接使用 Milky 的 Fraq 应用。

在设置中选择 `Milky 1.2` 后，Matcha 默认监听 `127.0.0.1:30001`，提供以下接口：

- `POST /api/{endpoint}`：调用 Matcha 中的好友、群聊与消息行为。
- `GET /event`：通过 WebSocket 或 SSE 接收模拟事件。
- `Authorization: Bearer <token>`：设置访问令牌后启用鉴权。

Fraq 可使用 `Context.fromUrl('http://127.0.0.1:30001')` 连接这个协议端。完整支持情况见下方“协议适配”中的 Milky 1.2 标准清单。

## ✨ 特性

- 小而美，轻巧体积，简约 UI
- 全平台支持（Windows，Mac，Linux）
- 多协议适配支持
- 支持多用户多群组
- 支持多媒体消息（图片、语音、视频）
- 原始事件展示

## 🚀 快速上手

### 创建角色

点击侧边栏底部的圆形按钮，打开角色管理面板。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/user-manage-dark.webp">
  <source media="(prefers-color-scheme: light)" srcset="./docs/user-manage-light.webp">
  <img src="./docs/user-manage-light.webp" alt="user manage" />
</picture>

点击“新建角色”，填写角色信息并创建。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/create-user-dark.webp">
  <source media="(prefers-color-scheme: light)" srcset="./docs/create-user-light.webp">
  <img src="./docs/create-user-light.webp" alt="create user" />
</picture>

### 设置用户与机器人

点击角色列表中的按钮，将角色设置为用户和机器人。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/bot-user-dark.webp">
  <source media="(prefers-color-scheme: light)" srcset="./docs/bot-user-light.webp">
  <img src="./docs/bot-user-light.webp" alt="bot user" />
</picture>

### 设置连接

点击侧边栏底部的菜单按钮，打开设置页面，在设置页面中，选择“连接”设置，填写连接信息。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/connect-settings-dark.webp">
  <source media="(prefers-color-scheme: light)" srcset="./docs/connect-settings-light.webp">
  <img src="./docs/connect-settings-light.webp" alt="connect settings" />
</picture>

提示连接成功后，即可开始使用。

## 🔌 协议适配

- <details>
  <summary>Milky 1.2 标准</summary>

  当前支持情况基于 Milky 1.2.2。勾选表示 Matcha 已提供对应的模拟行为。

  ### 动作

  - [x] 获取登录信息（get_login_info）
  - [x] 获取协议端信息（get_impl_info）
  - [x] 获取用户个人信息（get_user_profile）
  - [x] 获取好友列表（get_friend_list）
  - [x] 获取好友信息（get_friend_info）
  - [x] 获取群列表（get_group_list）
  - [x] 获取群信息（get_group_info）
  - [x] 获取群成员列表（get_group_member_list）
  - [x] 获取群成员信息（get_group_member_info）
  - [x] 获取置顶的好友和群列表（get_peer_pins）
  - [x] 设置好友或群的置顶状态（set_peer_pin）
  - [x] 设置 QQ 账号头像（set_avatar）
  - [x] 设置 QQ 账号昵称（set_nickname）
  - [x] 设置 QQ 账号个性签名（set_bio）
  - [x] 获取自定义表情 URL 列表（get_custom_face_url_list）
  - [x] 获取 Cookies（get_cookies）
  - [x] 获取 CSRF Token（get_csrf_token）
  - [x] 发送私聊消息（send_private_message）
  - [x] 发送群聊消息（send_group_message）
  - [x] 撤回私聊消息（recall_private_message）
  - [x] 撤回群聊消息（recall_group_message）
  - [x] 获取消息（get_message）
  - [x] 获取历史消息列表（get_history_messages）
  - [x] 获取临时资源链接（get_resource_temp_url）
  - [x] 获取合并转发消息内容（get_forwarded_messages）
  - [x] 标记消息为已读（mark_message_as_read，仅返回成功）
  - [x] 发送好友戳一戳（send_friend_nudge）
  - [x] 发送名片点赞（send_profile_like，仅返回成功）
  - [x] 删除好友（delete_friend）
  - [x] 获取好友请求列表（get_friend_requests）
  - [x] 同意好友请求（accept_friend_request）
  - [x] 拒绝好友请求（reject_friend_request）
  - [x] 设置群名称（set_group_name）
  - [x] 设置群头像（set_group_avatar）
  - [x] 设置群名片（set_group_member_card）
  - [x] 设置群成员专属头衔（set_group_member_special_title）
  - [x] 设置群管理员（set_group_member_admin）
  - [x] 设置群成员禁言（set_group_member_mute）
  - [x] 设置群全员禁言（set_group_whole_mute）
  - [x] 踢出群成员（kick_group_member）
  - [x] 获取群公告列表（get_group_announcements）
  - [x] 发送群公告（send_group_announcement）
  - [x] 删除群公告（delete_group_announcement）
  - [x] 获取群精华消息列表（get_group_essence_messages）
  - [x] 设置群精华消息（set_group_essence_message）
  - [x] 退出群（quit_group）
  - [x] 发送群消息表情回应（send_group_message_reaction，仅返回成功）
  - [x] 发送群戳一戳（send_group_nudge）
  - [x] 获取群通知列表（get_group_notifications）
  - [x] 同意入群或邀请他人入群请求（accept_group_request）
  - [x] 拒绝入群或邀请他人入群请求（reject_group_request）
  - [x] 同意他人邀请自身入群（accept_group_invitation）
  - [x] 拒绝他人邀请自身入群（reject_group_invitation）
  - [x] 上传私聊文件（upload_private_file）
  - [x] 上传群文件（upload_group_file）
  - [x] 获取私聊文件下载链接（get_private_file_download_url）
  - [x] 获取群文件下载链接（get_group_file_download_url）
  - [x] 获取群文件列表（get_group_files）
  - [x] 移动群文件（move_group_file）
  - [x] 重命名群文件（rename_group_file）
  - [x] 删除群文件（delete_group_file）
  - [x] 创建群文件夹（create_group_folder）
  - [x] 重命名群文件夹（rename_group_folder）
  - [x] 删除群文件夹（delete_group_folder）

  ### 事件

  - [ ] 机器人离线事件（bot_offline）
  - [x] 消息接收事件（message_receive）
  - [x] 消息撤回事件（message_recall）
  - [ ] 会话置顶变更事件（peer_pin_change）
  - [x] 好友请求事件（friend_request）
  - [x] 入群请求事件（group_join_request）
  - [ ] 群成员邀请他人入群请求事件（group_invited_join_request）
  - [x] 他人邀请自身入群事件（group_invitation）
  - [x] 好友戳一戳事件（friend_nudge）
  - [ ] 好友文件上传事件（friend_file_upload）
  - [x] 群管理员变更事件（group_admin_change）
  - [ ] 群精华消息变更事件（group_essence_message_change）
  - [x] 群成员增加事件（group_member_increase）
  - [x] 群成员减少事件（group_member_decrease）
  - [x] 群名称变更事件（group_name_change）
  - [ ] 群消息表情回应事件（group_message_reaction）
  - [x] 群禁言事件（group_mute）
  - [x] 群全体禁言事件（group_whole_mute）
  - [x] 群戳一戳事件（group_nudge）
  - [ ] 群文件上传事件（group_file_upload）
  </details>

- <details>
  <summary>OneBot v11 标准</summary>

  ### 动作

  - [x] 发送私聊消息（send_private_msg）
  - [x] 发送群消息（send_group_msg）
  - [x] 发送消息（send_msg）
  - [x] 撤回消息（delete_msg）
  - [x] 获取消息（get_msg）
  - [ ] 获取合并转发消息（get_forward_msg）
  - [x] 群组踢人（set_group_kick）
  - [x] 群组单人禁言（set_group_ban）
  - [ ] 群组匿名用户禁言（set_group_anonymous_ban）
  - [x] 群组全员禁言（set_group_whole_ban）
  - [x] 群组设置管理员（set_group_admin）
  - [ ] 群组匿名（set_group_anonymous）
  - [x] 设置群名片（set_group_card）
  - [x] 设置群名（set_group_name）
  - [x] 退出群组（set_group_leave）
  - [x] 设置群组专属头衔（set_group_special_title）
  - [x] 处理加好友请求（set_friend_add_request）
  - [x] 处理加群请求／邀请（set_group_add_request）
  - [x] 获取登录号信息（get_login_info）
  - [x] 获取陌生人信息（get_stranger_info）
  - [x] 获取好友列表（get_friend_list）
  - [x] 获取群信息（get_group_info）
  - [x] 获取群列表（get_group_list）
  - [x] 获取群成员信息（get_group_member_info）
  - [x] 获取群成员列表（get_group_member_list）
  - [ ] 获取群荣誉信息（get_group_honor_info）
  - [ ] 获取语音（get_record）
  - [ ] 获取图片（get_image）
  - [x] 检查是否可以发送图片（can_send_image）
  - [x] 检查是否可以发送语音（can_send_record）
  - [x] 获取运行状态（get_status）
  - [x] 获取版本信息（get_version_info）

  ### 事件

  - [x] 私聊消息
  - [x] 群消息
  - [ ] 群文件上传
  - [x] 群管理员变动
  - [x] 群成员减少
  - [x] 群成员增加
  - [x] 群禁言
  - [x] 好友添加
  - [x] 群消息撤回
  - [x] 好友消息撤回
  - [x] 群内戳一戳
  - [ ] 群红包运气王
  - [ ] 群成员荣誉变更
  - [x] 加好友请求
  - [x] 加群请求／邀请
  </details>

- <details>
  <summary>OneBot v12 标准</summary>

  ### 动作

  - [x] 获取支持的动作列表（get_supported_actions）
  - [x] 获取运行状态（get_status）
  - [x] 获取版本信息（get_version）
  - [x] 发送消息（send_message）
  - [x] 撤回消息（delete_message）
  - [x] 获取机器人自身信息（get_self_info）
  - [x] 获取用户信息（get_user_info）
  - [x] 获取好友列表（get_friend_list）
  - [x] 获取群信息（get_group_info）
  - [x] 获取群列表（get_group_list）
  - [x] 获取群成员信息（get_group_member_info）
  - [x] 获取群成员列表（get_group_member_list）
  - [x] 设置群名称（set_group_name）
  - [x] 退出群（leave_group）
  - [x] 上传文件（upload_file）
  - [x] 分片上传文件（upload_file_fragmented）
  - [x] 获取文件（get_file）
  - [x] 分片获取文件（get_file_fragmented）

  ### 事件

  - [x] 私聊消息（message.private）
  - [x] 好友增加（notice.friend_increase）
  - [x] 好友减少（notice.friend_decrease）
  - [x] 私聊消息删除（notice.private_message_delete）
  - [x] 群消息（message.group）
  - [x] 群成员增加（notice.group_member_increase）
  - [x] 群成员减少（notice.group_member_decrease）
  - [x] 群消息删除（notice.group_message_delete）
  </details>

## 📋 路线图

请访问本项目的 [Projects](https://github.com/users/A-kirami/projects/8)

## 🤝 贡献

请参阅[贡献指南](./.github/CONTRIBUTING.md)

### 🍻 鸣谢

感谢以下开发者对本项目的贡献

<a href="https://github.com/A-kirami/matcha/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=A-kirami/matcha" />
</a>

## 🎊 活动

![Alt](https://repobeats.axiom.co/api/embed/647a10251f545090f351a6afc3b2a124494df1a2.svg 'Repobeats analytics image')

## 📄 许可证

Code: AGPL-3.0 - 2023 - Akirami

Logo: CC-BY-NC-ND, Designs by Akirami

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FA-kirami%2Fmatcha.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FA-kirami%2Fmatcha?ref=badge_large)

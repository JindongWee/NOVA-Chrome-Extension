# NOVA Chrome 美化插件（测试版）

NOVA 是一个 Manifest V3 Chrome 新标签页扩展，提供简洁的深色新标签页。

## 下载
[下载最新源码 ZIP](https://github.com/JindongWee/NOVA-Chrome-Extension/archive/refs/heads/main.zip)

下载后解压，扩展程序目录为 `NOVA-Chrome-Extension-main/NOVA_NewTab`。

## 功能
- 数字时钟与中文日期
- 搜索框，支持 Google、Bing、DuckDuckGo
- 常用网站快捷入口
- 内置背景与强调色切换
- 上传本地壁纸
- 添加、删除快捷入口
- 设置保存在 Chrome 本地存储中

## 安装
1. 下载上面的 ZIP 压缩包并解压。
2. 打开 Chrome，访问 `chrome://extensions`。
3. 开启右上角的「开发者模式」。
4. 点击「加载已解压的扩展程序」。
5. 选择解压目录中的 `NOVA_NewTab` 文件夹（该文件夹内应直接包含 `manifest.json`）。
6. 新建标签页即可使用。

## 隐私与权限
扩展仅申请 `storage` 权限，用于保存用户设置；不申请浏览历史、标签页或网站读取权限。页面不加载第三方字体或远程脚本。

## 版本说明
当前版本实现的是新标签页替换，不会直接改变 Chrome 顶部标签栏、工具栏和地址栏颜色。浏览器外观颜色可通过 Chrome 自带的「自定义 Chrome」设置调整。

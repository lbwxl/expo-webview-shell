# 一条咸鱼（Expo WebView Shell）
一个基于 Expo 的 WebView 外壳应用：原生端使用 `react-native-webview`，Web 端使用 `iframe`，用于加载同一个网站。

## 当前行为
- 开发环境加载 `DEV_TARGET_URL`
- 生产环境加载 `PROD_TARGET_URL`
- 目标地址在 `App.tsx` 中通过 `__DEV__` 自动切换
- 页面加载失败时会显示错误提示和“重试”按钮

当前配置位置：
- `App.tsx`
  - `DEV_TARGET_URL = 'http://192.168.0.5:5500/index.html'`
  - `PROD_TARGET_URL = 'https://lbwxl.github.io/website-xy/'`

## 环境要求
- Node.js（建议 LTS）
- npm
- Android 本地打包时需要：
  - JDK 17
  - Android SDK

## 安装依赖
```bash
npm install
```

## 开发调试
```bash
npm run start
```

常用命令：
```bash
npm run android
npm run web
```

## 修改 WebView 目标地址
编辑 `App.tsx` 中这两个常量即可：
- `DEV_TARGET_URL`
- `PROD_TARGET_URL`

## 本地打包 APK
首次如果还没有 `android/` 目录，先执行：
```bash
npx expo prebuild --platform android
```

然后执行打包脚本：
```powershell
.\build-apk.ps1
```

可选清理后再打包：
```powershell
.\build-apk.ps1 -Clean
```

产物路径：
- `android/app/build/outputs/apk/release/app-release.apk`

## 主要文件
- `App.tsx`：应用入口与 WebView/iframe 加载逻辑
- `app.json`：Expo 配置（应用名、图标、Android 配置等）
- `build-apk.ps1`：本地 Android Release APK 打包脚本

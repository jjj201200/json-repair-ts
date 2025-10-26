# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-27

### Added
- 🎉 初始版本发布
- ✨ 完整的 TypeScript 实现
- 📦 ES 模块支持 (ESM)
- 🌳 Tree-shaking 支持
- 💪 完整的类型定义文件
- 🔧 修复各种 JSON 格式错误
  - 缺少引号的键名
  - 单引号转双引号
  - 尾随逗号
  - 注释 (单行和多行)
  - 未闭合的括号
  - 混合引号
- 📖 可选的修复日志功能
- ⚡ 高性能流式解析
- 🚀 零依赖

### Features
- `repairJson()` - 修复并返回 JSON 字符串
- `loads()` - 修复并解析 JSON 字符串
- `load()` - 从文件描述符读取并修复
- `fromFile()` - 从文件读取并修复
- `repairJsonFromFile()` - 从文件修复并返回字符串
- `JSONParser` - 高级解析器类
- `JsonContext` - JSON 上下文管理
- `ObjectComparer` - 对象比较工具

### Technical
- Node.js 14+ 支持
- TypeScript 5.9 编译
- ES2020 目标
- 完整的 source maps 和 declaration maps
- 优化的 package.json exports 配置

[1.0.0]: https://github.com/yourusername/json-repair-ts/releases/tag/v1.0.0

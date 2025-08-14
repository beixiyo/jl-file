# @jl-org/file 📁

<div align="center">
  <img alt="npm-version" src="https://img.shields.io/npm/v/@jl-org/file?color=red&logo=npm" />
  <img alt="License" src="https://img.shields.io/npm/l/@jl-org/file?color=blue" />
  <img alt="typescript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img alt="vitest" src="https://img.shields.io/badge/Vitest-646CFF?logo=vitest&logoColor=white" />
  <img alt="node.js" src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" />
  <img alt="github" src="https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white" />
</div>

<div align="center">
  <a href="./README.md">中文</a>
  <span>|</span>
  <a href="./README.en.md">English</a>
</div>

<div align="center">
  现代化、轻量、简洁的文件处理工具库，提供现代化的 API 和强大的功能
</div>

## 🌟 特性

- 📂 **深度递归遍历** - 轻松获取整个目录结构和所有子文件
- 🔗 **父级指针引用** - 每个文件对象都有指向父级的引用，方便向上查找
- 🛡️ **智能检测机制** - 自动检查目录是否存在，不存在则根据配置创建
- 📏 **详细文件信息** - 获取文件大小、创建时间、修改时间等元数据
- 🧠 **智能覆盖策略** - 支持安全的文件/目录覆盖操作
- ⚙️ **灵活配置选项** - 可通过配置项自定义行为，满足不同需求

## 📦 安装

```bash
npm install @jl-org/file
# 或
yarn add @jl-org/file
# 或
pnpm add @jl-org/file
```

## 🚀 使用

```ts
import { JlFile } from '@jl-org/file'

// 创建文件实例
const file = JlFile.genFile('/path/to/file.txt')

// 读取文件内容
const content = await file.getContent('utf-8')

// 获取文件大小
const size = await file.getAllSize()

// 获取所有子文件（深度递归）
const allChildren = await JlFile.getAllChildren('/path/to/directory')

// 通过父级指针查找
const parent = allChildren[0].parent
```

### 智能特性说明

本库具有多种智能特性，让文件操作更加便捷：

1. **智能目录检测**：
   - `readDir` 方法会自动检测目录是否存在，不存在时根据配置自动创建
   - `touch` 和 `mkdir` 方法也有类似的智能检测机制

2. **智能覆盖策略**：
   - 当目标文件/目录已存在时，可通过 `overwrite` 选项控制是否覆盖
   - 默认情况下会打印警告信息而不是抛出异常

3. **智能目录创建**：
   - 创建文件时，如果父目录不存在且 `autoCreateDir` 为 `true`（默认），会自动创建父目录

4. **深度递归遍历**：
   - `getAllChildren` 方法可以深度递归获取所有子文件，并为每个文件对象添加父级指针引用

5. **文件内容检查**：
   - `isEmpty` 方法可以检查文件是否为空，支持去除空白字符的选项

6. **文件内容追加**：
   - `append` 方法可以在文件末尾追加内容，支持自动创建文件和添加换行符的选项

7. **逐行读取文件**：
   - `readLine` 方法可以逐行读取文件内容，返回异步迭代器

## 📚 API

### 静态方法

| 方法 | 描述 |
|------|------|
| `JlFile.genFile(path)` | 创建文件实例 |
| `JlFile.readDir(path)` | 读取目录内容 |
| `JlFile.mkdir(path, opts)` | 创建目录 |
| `JlFile.touch(path, content, opts)` | 创建文件 |
| `JlFile.isExist(path)` | 检查路径是否存在 |
| `JlFile.getAllChildren(path)` | 深度递归获取所有子文件 |
| `JlFile.search(dirPath, pattern, recursive)` | 在指定目录中搜索匹配模式的文件 |

### 实例方法

| 方法 | 描述 |
|------|------|
| `file.getContent(options?)` | 获取文件内容 |
| `file.getAllSize()` | 获取文件总大小 |
| `file.getChildren()` | 获取子文件列表 |
| `file.rename(newName)` | 重命名文件 |
| `file.mv(newPath)` | 移动文件 |
| `file.cp(newPath, opts)` | 复制文件 |
| `file.write(content, opts)` | 写入文件 |
| `file.append(content, opts?)` | 在文件末尾追加内容 |
| `file.rm(opts)` | 删除文件 |
| `file.isEqual(otherFile)` | 比较当前文件与另一个文件是否内容相同 |
| `file.isEmpty(trim?)` | 检查文件是否为空 |
| `file.readLine()` | 逐行读取文件内容 |
| `file.getStats()` | 获取文件状态 |
| `file.setPermissions(mode)` | 设置文件权限 |
| `file.isReadable()` | 检查文件是否可读 |
| `file.isWritable()` | 检查文件是否可写 |
| `file.isExecutable()` | 检查文件是否可执行 |
| `file.watch(callback)` | 监听文件变化 |
| `file.getHash(algorithm)` | 计算文件的哈希值 |

## 🧪 测试

```bash
npm run test       # 运行测试（监听模式）
npm run test:run   # 运行测试（单次执行）
```

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
  A modern file utility library with powerful features, providing modern APIs and powerful features.
</div>

## 🌟 Features

- 🔄 **Async Instance Creation** - All file operations are asynchronous to avoid blocking the main thread
- 📂 **Deep Recursive Traversal** - Easily get entire directory structures and all subfiles
- 🔗 **Parent Pointer Reference** - Each file object has a reference to its parent for easy upward lookup
- 🛡️ **Automatic Check Mechanism** - Automatically checks if directories exist when creating files
- 📏 **Detailed File Information** - Get metadata such as file size, creation time, and modification time
- 🧠 **Smart Overwrite Strategy** - Supports safe file/directory overwrite operations

## 📦 Installation

```bash
npm install @jl-org/file
# or
yarn add @jl-org/file
# or
pnpm add @jl-org/file
```

## 🚀 Usage

```ts
import { JlFile } from '@jl-org/file'

// Create file instance
const file = await JlFile.genFile('/path/to/file.txt')

// Read file content
const content = await file.getContent('utf-8')

// Get file size
const size = await file.getAllSize()

// Get all subfiles (deep recursion)
const allChildren = await JlFile.getAllChildren('/path/to/directory')

// Find via parent pointer
const parent = allChildren[0].parent
```

## 📚 API

### Static Methods

| Method | Description |
|--------|-------------|
| `JlFile.genFile(path)` | Asynchronously create a file instance |
| `JlFile.readDir(path)` | Read directory contents |
| `JlFile.mkdir(path, opts)` | Create directory |
| `JlFile.touch(path, content, opts)` | Create file |
| `JlFile.isExist(path)` | Check if path exists |
| `JlFile.getAllChildren(path)` | Deep recursive get all subfiles |
| `JlFile.search(dirPath, pattern, recursive)` | Search for files matching a pattern in a directory |

### Instance Methods

| Method | Description |
|--------|-------------|
| `file.getContent(options?)` | Get file content |
| `file.getAllSize()` | Get total file size |
| `file.getChildren()` | Get subfile list |
| `file.rename(newName)` | Rename file |
| `file.mv(newPath)` | Move file |
| `file.cp(newPath, opts)` | Copy file |
| `file.write(content, opts)` | Write to file |
| `file.rm(opts)` | Delete file |
| `file.isEqual(otherFile)` | Compare if current file content is equal to another file |
| `file.getStats()` | Get file stats |
| `file.setPermissions(mode)` | Set file permissions |
| `file.isReadable()` | Check if file is readable |
| `file.isWritable()` | Check if file is writable |
| `file.isExecutable()` | Check if file is executable |
| `file.watch(callback)` | Watch for file changes |
| `file.getHash(algorithm)` | Calculate file hash |

## 🧪 Testing

```bash
npm run test       # Run tests (watch mode)
npm run test:run   # Run tests (single execution)
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT © CJL
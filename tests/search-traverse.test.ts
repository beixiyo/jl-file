import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('File Search and Traversal', () => {
  const testDir = join(tmpdir(), 'jlfile_search_traverse_test')
  const testFile = join(testDir, 'test.txt')
  const testDirPath = join(testDir, 'subdir')

  beforeEach(() => {
    // 创建测试目录和文件
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
    writeFileSync(testFile, 'Hello, world!')
    if (!existsSync(testDirPath)) {
      mkdirSync(testDirPath, { recursive: true })
    }
  })

  afterEach(() => {
    // 清理测试文件和目录
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('getAllChildren', () => {
    it('should get all children recursively', async () => {
      // 创建更复杂的目录结构进行测试
      const deepDir = join(testDir, 'deep', 'deeper')
      mkdirSync(deepDir, { recursive: true })
      writeFileSync(join(deepDir, 'deep.txt'), 'deep content')

      const allChildren = await JlFile.getAllChildren(testDir)
      expect(allChildren.length).toBeGreaterThan(3) // 至少包含原始文件和目录，以及新创建的

      // 检查是否包含所有层级的文件
      expect(allChildren.some(f => f.name === 'test.txt')).toBe(true)
      expect(allChildren.some(f => f.name === 'subdir')).toBe(true)
      expect(allChildren.some(f => f.name === 'deep')).toBe(true)
      expect(allChildren.some(f => f.name === 'deeper')).toBe(true)
      expect(allChildren.some(f => f.name === 'deep.txt')).toBe(true)
    })
  })

  describe('getAllSize', () => {
    it('should calculate total size of directory', async () => {
      const dir = await JlFile.genFile(testDir)
      const size = await dir.getAllSize()
      expect(size).toBeGreaterThan(0)
    })
  })

  describe('search', () => {
    it('should search files by pattern', async () => {
      // 创建测试文件
      const jsFile = join(testDir, 'test.js')
      writeFileSync(jsFile, 'console.log("test");')

      const results = await JlFile.search(testDir, '*.js')
      expect(results.some(f => f.name === 'test.js')).toBe(true)

      // 清理测试文件
      rmSync(jsFile)
    })

    it('should search files recursively', async () => {
      // 创建嵌套目录和文件
      const deepDir = join(testDir, 'deep')
      const deepFile = join(deepDir, 'deep.txt')
      mkdirSync(deepDir)
      writeFileSync(deepFile, 'deep content')

      const results = await JlFile.search(testDir, '*.txt', true)
      expect(results.some(f => f.name === 'deep.txt')).toBe(true)

      // 清理测试文件
      rmSync(deepDir, { recursive: true })
    })
  })
})
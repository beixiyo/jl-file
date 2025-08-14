import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('File Comparison and Hashing', () => {
  const testDir = join(tmpdir(), 'jlfile_compare_hash_test')
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

  describe('isEqual', () => {
    it('should compare two identical files', async () => {
      // 创建两个相同内容的文件
      const file1Path = join(testDir, 'file1.txt')
      const file2Path = join(testDir, 'file2.txt')

      writeFileSync(file1Path, 'same content')
      writeFileSync(file2Path, 'same content')

      const file1 = JlFile.genFile(file1Path)
      const file2 = JlFile.genFile(file2Path)

      const isEqual = await file1.isEqual(file2)
      expect(isEqual).toBe(true)

      // 清理测试文件
      rmSync(file1Path)
      rmSync(file2Path)
    })

    it('should compare two different files', async () => {
      // 创建两个不同内容的文件
      const file1Path = join(testDir, 'file1.txt')
      const file2Path = join(testDir, 'file2.txt')

      writeFileSync(file1Path, 'content 1')
      writeFileSync(file2Path, 'content 2')

      const file1 = JlFile.genFile(file1Path)
      const file2 = JlFile.genFile(file2Path)

      const isEqual = await file1.isEqual(file2)
      expect(isEqual).toBe(false)

      // 清理测试文件
      rmSync(file1Path)
      rmSync(file2Path)
    })
  })

  describe('watch', () => {
    it('should watch file changes', async () => {
      const file = JlFile.genFile(testFile)
      let changeCount = 0

      // 设置监听器
      const stopWatching = file.watch((eventType) => {
        changeCount++
      })

      // 修改文件
      await file.write('updated content')

      // 等待事件触发
      await new Promise(resolve => setTimeout(resolve, 100))

      // 停止监听
      stopWatching()

      // 验证至少有一次变化
      expect(changeCount).toBeGreaterThan(0)
    })
  })

  describe('getHash', () => {
    it('should calculate file hash', async () => {
      const file = JlFile.genFile(testFile)

      // 计算哈希值
      const hash = await file.getHash('sha256')

      // 验证返回的是字符串
      expect(typeof hash).toBe('string')

      // 验证长度符合 SHA256 格式 (64 个十六进制字符)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should throw error for directories', async () => {
      const dir = JlFile.genFile(testDir)

      // 尝试计算目录哈希值应该抛出错误
      await expect(dir.getHash('sha256')).rejects.toThrow('Cannot calculate hash for directories')
    })
  })
})
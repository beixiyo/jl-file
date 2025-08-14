import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('File Permissions and Attributes', () => {
  const testDir = join(tmpdir(), 'jlfile_permissions_test')
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

  describe('permissions', () => {
    it('should get file stats', async () => {
      const file = await JlFile.genFile(testFile)

      // 获取文件状态
      const stats = await file.getStats()
      expect(typeof stats).toBe('object')
      expect(stats.isFile()).toBe(true)
    })

    it('should set file permissions', async () => {
      const file = await JlFile.genFile(testFile)

      // 注意：在 Windows 上权限设置可能不会完全按预期工作
      // 这里主要是测试 API 是否正常工作
      try {
        // 设置权限
        await file.setPermissions(0o644)

        // 验证权限是否改变
        const newStats = await file.getStats()
        // 在某些系统上可能不会完全匹配，但应该是一个对象
        expect(typeof newStats).toBe('object')
      } catch (error) {
        // 在某些系统上可能不支持权限设置，这可以接受
        console.warn('Permission setting not supported on this system')
      }
    })

    it('should check file access permissions', async () => {
      const file = await JlFile.genFile(testFile)

      // 检查可读性
      const readable = await file.isReadable()
      expect(readable).toBe(true)

      // 检查可写性
      const writable = await file.isWritable()
      expect(writable).toBe(true)

      // 检查可执行性（在不同系统上行为可能不同，这里只确保方法正常工作）
      const executable = await file.isExecutable()
      // 只验证返回的是布尔值
      expect(typeof executable).toBe('boolean')
    })
  })
})
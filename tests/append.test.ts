import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('append Method', () => {
  const testDir = join(tmpdir(), 'jlfile_append_test')
  const testFile = join(testDir, 'test.txt')
  const nonExistentFile = join(testDir, 'nonexistent.txt')

  beforeEach(() => {
    // 创建测试目录和文件
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
    writeFileSync(testFile, 'Hello')
  })

  afterEach(() => {
    // 清理测试文件和目录
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('append', () => {
    it('should append content to existing file', async () => {
      const file = JlFile.genFile(testFile)
      await file.append(' World')

      const content = readFileSync(testFile, 'utf-8')
      expect(content).toBe('Hello World')
    })

    it('should create file and add content when file does not exist and autoCreate is true', async () => {
      const file = new JlFile(nonExistentFile, true) // 直接创建实例而不是使用 genFile
      await file.append('New content', { autoCreate: true })

      expect(existsSync(nonExistentFile)).toBe(true)
      const content = readFileSync(nonExistentFile, 'utf-8')
      expect(content).toBe('New content')
    })

    it('should throw error when file does not exist and autoCreate is false', async () => {
      // 先确保文件不存在
      if (existsSync(nonExistentFile)) {
        rmSync(nonExistentFile)
      }

      // 直接创建 JlFile 实例而不使用 genFile
      const file = new JlFile(nonExistentFile, true)
      await expect(file.append('New content', { autoCreate: false }))
        .rejects.toThrow('File does not exist')
    })

    it('should throw error when trying to append to directory', async () => {
      const dir = JlFile.genFile(testDir)
      await expect(dir.append('Content'))
        .rejects.toThrow('Cannot append to directory')
    })

    it('should append multiple times', async () => {
      const file = JlFile.genFile(testFile)
      await file.append(' World')
      await file.append('!')
      await file.append('\nSecond line')

      const content = readFileSync(testFile, 'utf-8')
      expect(content).toBe('Hello World!\nSecond line')
    })
  })
})
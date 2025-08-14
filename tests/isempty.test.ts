import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('isEmpty Method', () => {
  const testDir = join(tmpdir(), 'jlfile_isempty_test')
  const emptyFile = join(testDir, 'empty.txt')
  const whitespaceFile = join(testDir, 'whitespace.txt')
  const contentFile = join(testDir, 'content.txt')

  beforeEach(() => {
    // 创建测试目录和文件
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
    writeFileSync(emptyFile, '')
    writeFileSync(whitespaceFile, '   \n\t  ')
    writeFileSync(contentFile, 'Hello, world!')
  })

  afterEach(() => {
    // 清理测试文件和目录
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('isEmpty', () => {
    it('should return true for empty file', async () => {
      const file = JlFile.genFile(emptyFile)
      expect(await file.isEmpty()).toBe(true)
    })

    it('should return true for whitespace-only file with trim=true (default)', async () => {
      const file = JlFile.genFile(whitespaceFile)
      expect(await file.isEmpty()).toBe(true)
    })

    it('should return false for whitespace-only file with trim=false', async () => {
      const file = JlFile.genFile(whitespaceFile)
      expect(await file.isEmpty(false)).toBe(false)
    })

    it('should return false for file with content', async () => {
      const file = JlFile.genFile(contentFile)
      expect(await file.isEmpty()).toBe(false)
    })

    it('should return false for directory', async () => {
      const dir = JlFile.genFile(testDir)
      expect(await dir.isEmpty()).toBe(false)
    })
  })
})
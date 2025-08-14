import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('File Move and Copy Operations', () => {
  const testDir = join(tmpdir(), 'jlfile_move_copy_test')
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

  describe('rename', () => {
    it('should rename a file', async () => {
      const file = await JlFile.genFile(testFile)
      const newName = 'renamed.txt'
      const newPath = join(testDir, newName)

      await file.rename(newName)
      expect(existsSync(testFile)).toBe(false)
      expect(existsSync(newPath)).toBe(true)
    })
  })

  describe('mv', () => {
    it('should move a file', async () => {
      const file = await JlFile.genFile(testFile)
      const newDir = join(testDir, 'movedir')
      mkdirSync(newDir)
      const newPath = join(newDir, 'test.txt')

      await file.mv(newPath)
      expect(existsSync(testFile)).toBe(false)
      expect(existsSync(newPath)).toBe(true)
    })
  })

  describe('cp', () => {
    it('should copy a file', async () => {
      const file = await JlFile.genFile(testFile)
      const copyPath = join(testDir, 'copy.txt')

      await file.cp(copyPath, {})
      expect(existsSync(copyPath)).toBe(true)

      const copyFile = await JlFile.genFile(copyPath)
      const content = await copyFile.getContent('utf-8')
      expect(content).toBe('Hello, world!')
    })

    it('should copy a directory', async () => {
      const dir = await JlFile.genFile(testDirPath)
      const copyPath = join(testDir, 'copydir')

      await dir.cp(copyPath, { recursive: true })
      expect(existsSync(copyPath)).toBe(true)
    })
  })

  describe('write', () => {
    it('should write content to file', async () => {
      const file = await JlFile.genFile(testFile)
      await file.write('new content')

      const content = await file.getContent('utf-8')
      expect(content).toBe('new content')
    })
  })
})
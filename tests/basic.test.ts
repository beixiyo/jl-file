import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('Basic File Operations', () => {
  const testDir = join(tmpdir(), 'jlfile_basic_test')
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

  describe('genFile', () => {
    it('should create a file instance for a file', async () => {
      const file = JlFile.genFile(testFile)
      expect(file).toBeInstanceOf(JlFile)
      expect(file.isFile).toBe(true)
      expect(file.name).toBe('test.txt')
      expect(file.ext).toBe('.txt')
      expect(file.size).toBeGreaterThan(0)
    })

    it('should create a file instance for a directory', async () => {
      const dir = JlFile.genFile(testDir)
      expect(dir).toBeInstanceOf(JlFile)
      expect(dir.isFile).toBe(false)
      expect(dir.name).toBe('jlfile_basic_test')
    })
  })

  describe('readDir', () => {
    it('should read directory contents', async () => {
      const files = await JlFile.readDir(testDir)
      expect(files).toHaveLength(2)
      expect(files.some(f => f.name === 'test.txt')).toBe(true)
      expect(files.some(f => f.name === 'subdir')).toBe(true)
    })

    it('should create directory when it does not exist and autoCreateDir is true', async () => {
      const newDir = join(testDir, 'newdir')
      expect(existsSync(newDir)).toBe(false)

      const files = await JlFile.readDir(newDir, { autoCreateDir: true })
      expect(existsSync(newDir)).toBe(true)
      expect(files).toHaveLength(0)
    })

    it('should throw error when directory does not exist and autoCreateDir is false', async () => {
      const nonExistentDir = join(testDir, 'nonexistent')
      expect(existsSync(nonExistentDir)).toBe(false)

      await expect(JlFile.readDir(nonExistentDir, { autoCreateDir: false }))
        .rejects.toThrow('Directory does not exist')
    })
  })

  describe('isExist', () => {
    it('should return true for existing file', () => {
      expect(JlFile.isExist(testFile)).toBe(true)
    })

    it('should return true for existing directory', () => {
      expect(JlFile.isExist(testDir)).toBe(true)
    })

    it('should return false for non-existing path', () => {
      expect(JlFile.isExist(join(testDir, 'nonexistent'))).toBe(false)
    })
  })

  describe('getContent', () => {
    it('should read file content as string', async () => {
      const file = JlFile.genFile(testFile)
      const content = await file.getContent('utf-8')
      expect(content).toBe('Hello, world!')
    })

    it('should read file content as buffer', async () => {
      const file = JlFile.genFile(testFile)
      const content = await file.getContent()
      expect(content).toBeInstanceOf(Buffer)
      expect(content?.toString()).toBe('Hello, world!')
    })

    it('should return null for directory', async () => {
      const dir = JlFile.genFile(testDir)
      const content = await dir.getContent()
      expect(content).toBeNull()
    })
  })

  describe('getChildren', () => {
    it('should get children of directory', async () => {
      const dir = JlFile.genFile(testDir)
      const children = await dir.getChildren()
      expect(children).toHaveLength(2)
      expect(children.some(f => f.name === 'test.txt')).toBe(true)
      expect(children.some(f => f.name === 'subdir')).toBe(true)
    })

    it('should return empty array for file', async () => {
      const file = JlFile.genFile(testFile)
      const children = await file.getChildren()
      expect(children).toHaveLength(0)
    })
  })
})
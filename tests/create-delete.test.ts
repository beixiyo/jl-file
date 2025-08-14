import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('File Creation and Deletion', () => {
  const testDir = join(tmpdir(), 'jlfile_create_delete_test')
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

  describe('mkdir', () => {
    it('should create a directory', async () => {
      const newDir = join(testDir, 'newdir')
      await JlFile.mkdir(newDir, { overwrite: false })
      expect(existsSync(newDir)).toBe(true)
    })

    it('should overwrite existing directory when overwrite is true', async () => {
      const existingDir = join(testDir, 'existing')
      mkdirSync(existingDir)
      writeFileSync(join(existingDir, 'file.txt'), 'content')

      await JlFile.mkdir(existingDir, { overwrite: true })
      expect(existsSync(join(existingDir, 'file.txt'))).toBe(false)
    })

    it('should throw error when directory exists and overwrite is false', async () => {
      const existingDir = join(testDir, 'existing2')
      mkdirSync(existingDir)

      await expect(JlFile.mkdir(existingDir, { overwrite: false })).rejects.toThrow('dir is exist')
    })
  })

  describe('touch', () => {
    it('should create a new file', async () => {
      const newFile = join(testDir, 'newfile.txt')
      await JlFile.touch(newFile, 'content', { autoCreateDir: true, overwrite: false })
      expect(existsSync(newFile)).toBe(true)

      const file = await JlFile.genFile(newFile)
      const content = await file.getContent('utf-8')
      expect(content).toBe('content')
    })

    it('should overwrite existing file when overwrite is true', async () => {
      await JlFile.touch(testFile, 'new content', { autoCreateDir: true, overwrite: true })
      const file = await JlFile.genFile(testFile)
      const content = await file.getContent('utf-8')
      expect(content).toBe('new content')
    })

    it('should throw error when file exists and overwrite is false', async () => {
      await expect(JlFile.touch(testFile, 'content', { autoCreateDir: true, overwrite: false }))
        .rejects.toThrow('file is exist')
    })

    it('should create parent directory when autoCreateDir is true', async () => {
      const newFile = join(testDir, 'newdir', 'newfile.txt')
      await JlFile.touch(newFile, 'content', { autoCreateDir: true, overwrite: false })
      expect(existsSync(newFile)).toBe(true)
    })
  })

  describe('rm', () => {
    it('should remove a file', async () => {
      const file = await JlFile.genFile(testFile)
      await file.rm({ force: true })
      expect(existsSync(testFile)).toBe(false)
    })

    it('should remove a directory', async () => {
      const dir = await JlFile.genFile(testDirPath)
      await dir.rm({ recursive: true, force: true })
      expect(existsSync(testDirPath)).toBe(false)
    })
  })
})
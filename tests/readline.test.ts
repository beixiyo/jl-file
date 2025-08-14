import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JlFile } from '../src/JlFile'
import { join } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

describe('readLine Method', () => {
  const testDir = join(tmpdir(), 'jlfile_readline_test')
  const testFile = join(testDir, 'test.txt')
  const emptyFile = join(testDir, 'empty.txt')
  const multilineFile = join(testDir, 'multiline.txt')

  beforeEach(() => {
    // 创建测试目录和文件
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
    writeFileSync(testFile, 'Hello')
    writeFileSync(emptyFile, '')
    writeFileSync(multilineFile, 'Line 1\nLine 2\nLine 3')
  })

  afterEach(() => {
    // 清理测试文件和目录
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('readLine', () => {
    it('should read lines from a file with single line', async () => {
      const file = JlFile.genFile(testFile)
      const lines: string[] = []
      
      for await (const line of file.readLine()) {
        lines.push(line)
      }
      
      expect(lines).toEqual(['Hello'])
    })

    it('should read lines from an empty file', async () => {
      const file = JlFile.genFile(emptyFile)
      const lines: string[] = []
      
      for await (const line of file.readLine()) {
        lines.push(line)
      }
      
      expect(lines).toEqual([])
    })

    it('should read lines from a multiline file', async () => {
      const file = JlFile.genFile(multilineFile)
      const lines: string[] = []
      
      for await (const line of file.readLine()) {
        lines.push(line)
      }
      
      expect(lines).toEqual(['Line 1', 'Line 2', 'Line 3'])
    })

    it('should throw error when trying to read lines from directory', async () => {
      const dir = JlFile.genFile(testDir)
      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _line of dir.readLine()) {
          // This should not be reached
        }
      }).rejects.toThrow('Cannot read lines from directory')
    })
  })
})
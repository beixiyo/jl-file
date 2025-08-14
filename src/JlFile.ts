import { resolve, basename, extname, dirname, join } from 'node:path'
import { readFile, mkdir, rmdir, readdir, rename, writeFile, rm, cp, copyFile, chmod, access, appendFile, unlink } from 'node:fs/promises'
import { existsSync, constants, watch, createReadStream, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createInterface } from 'node:readline'
import type { CopyOptions, RmOptions, Mode, OpenMode, ObjectEncodingOptions } from 'node:fs'
import type { CreateFileOpts, WriteFileParams, CreateDirOpts, ReadFileParams, ReadDirOpts, AppendOpts } from './types'
import type { Abortable } from 'node:events'

/**
 * 文件操作类，提供对文件和目录的各种操作方法
 *
 * 请调用静态方法创建实例，因为是异步创建的，不能直接使用 new
 */
export class JlFile {
  /** 父级文件对象，只有调用 JlFile.getAllChildren 时才会有值 */
  parent: null | JlFile = null

  /**
   * @param filePath 文件完整路径
   * @param isFile 是否为文件（true为文件，false为目录）
   */
  constructor(
    public readonly filePath: string,
    public readonly isFile: boolean
  ) { }

  get name() {
    return basename(this.filePath)
  }

  get ext() {
    return extname(this.filePath)
  }

  get size() {
    return statSync(this.filePath).size
  }

  get createTime() {
    return statSync(this.filePath).birthtime
  }

  get updateTime() {
    return statSync(this.filePath).mtime
  }

  get stats() {
    return statSync(this.filePath)
  }

  async isEmpty(trim = true): Promise<boolean> {
    // 目录不为空
    if (!this.isFile) {
      return false
    }

    const content = await this.getContent('utf-8')
    if (content === null) {
      return true
    }

    if (trim) {
      return content?.trim() === ''
    }

    return content === ''
  }

  /**
   * 在文件末尾追加内容
   * - 如果文件不存在且 autoCreate 为 true（默认），会自动创建文件
   * - 如果文件不存在且 autoCreate 为 false，会抛出异常
   * @param content 要追加的内容
   * @param opts 配置选项
   * @returns Promise<void>
   */
  async append(content: string, opts?: AppendOpts): Promise<void> {
    // 如果是目录而不是文件，抛出异常
    if (!this.isFile) {
      throw new Error(`Cannot append to directory: ${this.filePath}`)
    }

    const { autoCreate = true, newLine = false } = opts || {}

    // 检查文件是否存在
    const isExist = JlFile.isExist(this.filePath)

    // 如果文件不存在
    if (!isExist) {
      if (autoCreate) {
        // 自动创建文件
        const dir = dirname(this.filePath)
        if (!JlFile.isExist(dir)) {
          await mkdir(dir, { recursive: true })
        }
        await writeFile(this.filePath, content)
        return
      } else {
        // 抛出异常
        throw new Error(`File does not exist: ${this.filePath}`)
      }
    }

    // 处理 newLine 选项
    let finalContent = content
    if (newLine) {
      // 读取文件最后的内容，检查是否已包含换行符
      const currentContent = await this.getContent('utf-8')
      if (currentContent && !currentContent.endsWith('\n')) {
        finalContent = '\n' + content
      }
    }

    // 追加内容到文件
    await appendFile(this.filePath, finalContent)
  }

  /**
   * 逐行读取文件内容
   *
   * 注意：为了确保文件资源被正确释放，请使用 `for await...of` 循环消费返回的迭代器。
   * 如果创建了迭代器但没有消费它，需要手动调用迭代器的 `return()` 方法来释放资源。
   *
   * @example
   * ```ts
   * // 推荐用法
   * for await (const line of file.readLine()) {
   *   console.log(line)
   * }
   *
   * // 如果需要提前退出，资源也会被自动释放
   * for await (const line of file.readLine()) {
   *   if (line === 'stop') break
   * }
   *
   * // 如果创建了迭代器但没有消费，需要手动释放资源
   * const iterator = file.readLine()
   * // ...一些操作
   * await iterator.return?.() // 释放资源
   * ```
   *
   * @returns AsyncIterableIterator<string>
   */
  async *readLine(): AsyncIterableIterator<string> {
    if (!this.isFile) {
      throw new Error(`Cannot read lines from directory: ${this.filePath}`)
    }

    const fileStream = createReadStream(this.filePath)
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    try {
      for await (const line of rl) {
        yield line
      }
    } finally {
      rl.close()
      fileStream.destroy()
    }
  }

  // ======================
  // * 静态方法
  // ======================

  /**
   * 创建文件实例
   * @param filePath 文件路径
   * @returns JlFile 实例
   */
  static genFile(filePath: string): JlFile {
    const _stat = statSync(filePath)
    const isFile = _stat.isFile()

    return new JlFile(filePath, isFile)
  }

  /**
   * 读取目录内容，同 JlFile.getChildren 方法，只不过改成静态方法
   * - 如果目录不存在且 autoCreateDir 为 true（默认），会自动创建目录
   * - 如果目录不存在且 autoCreateDir 为 false，会抛出异常
   *
   * @param dirPath 目录路径
   * @param opts 读取目录选项
   * @returns 目录中的文件列表
   */
  static async readDir(dirPath: string, opts?: ReadDirOpts): Promise<JlFile[]> {
    const { autoCreateDir = true } = opts || {}
    const isExist = JlFile.isExist(dirPath)

    if (!isExist) {
      if (autoCreateDir) {
        await mkdir(dirPath, { recursive: true })
      } else {
        throw new Error(`Directory does not exist: ${dirPath}`)
      }
    }

    const file = JlFile.genFile(dirPath)
    return await file.getChildren()
  }

  /**
   * 创建文件夹
   * - 如果目录已存在且 overwrite 为 false（默认），会打印警告信息而不是抛出异常
   * - 如果目录已存在且 overwrite 为 true，会先删除再重新创建
   * @param dirPath 文件夹路径
   * @param opts 创建选项（不包含 autoCreateDir）
   * @returns Promise<void>
   */
  static async mkdir(dirPath: string, opts?: CreateDirOpts): Promise<void> {
    const {
      overwrite = false,
      mkdirOptions = { recursive: true }
    } = opts || {}
    const isExist = JlFile.isExist(dirPath)

    if (isExist) {
      if (overwrite) {
        await rmdir(dirPath, { recursive: true })
        await mkdir(dirPath, mkdirOptions)
        return
      }

      console.warn('dir is exist (文件夹已存在)')
      return
    }

    await mkdir(dirPath, mkdirOptions)
  }

  /**
   * 创建文件
   * - 如果文件已存在且 overwrite 为 false（默认），会打印警告信息而不是抛出异常
   * - 如果文件已存在且 overwrite 为 true，会先删除再重新创建
   * - 如果父目录不存在且 autoCreateDir 为 true（默认），会自动创建父目录
   * - 如果父目录不存在且 autoCreateDir 为 false，会抛出异常
   * @param filePath 文件路径
   * @param content 创建时加入的内容
   * @param opts 创建选项
   * @returns Promise<void>
   */
  static async touch(filePath: string, content = '', opts?: CreateFileOpts): Promise<void> {
    const {
      overwrite = false,
      autoCreateDir = true,
      writeFileOptions
    } = opts || {}
    const isExist = JlFile.isExist(filePath)

    if (isExist) {
      if (overwrite) {
        await rm(filePath, { recursive: true, force: true })
      } else {
        console.warn('file is exist (文件已存在)')
        return
      }
    } else {
      if (!autoCreateDir) {
        throw new Error(`Directory does not exist: ${dirname(filePath)}`)
      } else {
        const dir = dirname(filePath)
        await mkdir(dir, { recursive: true })
      }
    }

    await writeFile(filePath, content, writeFileOptions)
  }

  /**
   * 检查文件或目录是否存在
   * @param path 文件或目录路径
   * @returns boolean
   */
  static isExist(path: string): boolean {
    return existsSync(path)
  }

  /**
   * 深度递归获取所有子文件，每个文件对象都有父指针
   * @param filePath 文件或目录路径
   * @returns Promise<JlFile[]>
   */
  static async getAllChildren(filePath: string): Promise<JlFile[]> {
    const
      /** 存放重复文件夹映射关系 @example { 文件名: [index, ...], ... } */
      folderMap: Record<string, number[]> = {},
      { fileArr, folders } = await JlFile.getRepeatChildren(filePath)

    folders.forEach((index) => {
      const name = fileArr[index].filePath
      if (folderMap[name]) {
        folderMap[name].push(index)
      } else {
        folderMap[name] = [index]
      }
    })

    // 删除重复的文件夹
    let delCount = 0
    Object.entries(folderMap).forEach(([_k, indexArr]) => {
      // 说明没有重复
      if (indexArr.length === 1) return

      indexArr.slice(1).forEach((index: number) => {
        fileArr.splice(index - delCount++, 1)
      })
    })

    return fileArr
  }

  /**
   * 在指定目录中搜索匹配模式的文件
   * @param dirPath 搜索目录路径
   * @param pattern 文件名匹配模式正则
   * @param recursive 是否递归搜索子目录
   * @returns Promise<JlFile[]>
   */
  static async search(dirPath: string, pattern: string, recursive = true): Promise<JlFile[]> {
    // 将通配符模式转换为正则表达式
    const regexPattern = pattern
      .replace(/\\/g, '\\\\')
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')

    const regex = new RegExp(`^${regexPattern}$`)

    // 获取所有文件
    const allFiles = recursive
      ? await JlFile.getAllChildren(dirPath)
      : await JlFile.readDir(dirPath)

    // 过滤匹配的文件
    return allFiles.filter(file => regex.test(file.name))
  }

  /**
   * 得到一个深度递归的文件数组，文件夹为重复的，所以这个方法不对外暴露。请调用 getAllChildren
   * @param filePath 文件或目录路径
   * @param parent 父级文件对象
   * @param fileArr 文件数组
   * @param excludeSet 排除集合
   * @param index 索引
   * @param folders 文件夹索引集合
   * @returns 重复的文件数组和重复索引的数组
   */
  private static async getRepeatChildren(
    filePath: string,
    parent: JlFile | null = null,
    fileArr: JlFile[] = [],
    excludeSet = new Set<string>()
  ): Promise<{ fileArr: JlFile[]; folders: Set<number> }> {
    const myFile = JlFile.genFile(filePath)
    myFile.parent = parent

    if (myFile.isFile) {
      fileArr.push(myFile)
      excludeSet.add(filePath)
      return { fileArr, folders: new Set<number>() }
    }

    excludeSet.add(filePath)
    const childrenFileArr = await genFileArr(myFile)
    const folders = new Set<number>()

    /** 遍历子文件夹，加入排除数组和文件夹数组 */
    childrenFileArr.forEach((item, index) => {
      /** 添加所有子节点以及自身 */
      fileArr.push(item)

      /** 把添加过的并且不是文件夹的排除 */
      if (item.isFile) {
        excludeSet.add(item.filePath)
      } else {
        // 记录文件夹索引，因为会重复
        folders.add(fileArr.length - 1)
      }
    })

    /** 递归子节点 */
    for (const item of childrenFileArr) {
      if (excludeSet.has(item.filePath)) {
        continue
      }

      const result = await JlFile.getRepeatChildren(
        item.filePath,
        myFile,
        fileArr,
        excludeSet
      )

      // 合并文件夹索引
      result.folders.forEach(index => folders.add(index))
    }

    return { fileArr, folders }
  }

  // ======================
  // * 实例方法
  // ======================

  /**
   * 获取当前文件内容
   * @returns 文件内容或 null（如果是目录）
   */
  getContent(
    options:
      | ({
        encoding: BufferEncoding
        flag?: OpenMode | undefined
      } & Abortable)
      | BufferEncoding,
  ): Promise<string | null>
  /**
   * 获取当前文件内容
   * @returns 文件内容或 null（如果是目录）
   */
  getContent(
    options?:
      | (
        & ObjectEncodingOptions
        & Abortable
        & {
          flag?: OpenMode | undefined
        }
      )
      | BufferEncoding
      | null,
  ): Promise<string | Buffer | null>
  async getContent(options?: ReadFileParams[1]): Promise<string | Buffer | null> {
    if (this.isFile) {
      const res = await readFile(this.filePath, options)
      return res
    }

    return null
  }

  /**
   * 递归获取当前文件实例所有内容的大小
   * @returns 文件总大小（字节）
   */
  async getAllSize(): Promise<number> {
    let size = 0
    const children = await JlFile.getAllChildren(this.filePath)
    children.forEach((item) => {
      size += item.size
    })

    return size
  }

  /**
   * 获取当前文件子级
   * @returns 子文件列表
   */
  async getChildren(): Promise<JlFile[]> {
    if (this.isFile) {
      // 文件不可能有子文件
      return []
    }

    const children = await readdir(this.filePath)
    return Promise.all(children.map(name => {
      const result = resolve(this.filePath, name)
      return JlFile.genFile(result)
    }))
  }

  /**
   * 重命名文件或目录
   * @param newName 新名称
   * @returns Promise<void>
   */
  async rename(newName: string): Promise<void> {
    const dir = dirname(this.filePath)
    return rename(this.filePath, join(dir, newName))
  }

  /**
   * 移动文件或目录
   * @param newPath 目标路径
   * @returns Promise<void>
   */
  async mv(newPath: string): Promise<void> {
    return rename(this.filePath, newPath)
  }

  /**
   * 复制文件或目录，会自动判断是否为文件夹
   * @param newPath 目标路径
   * @param opt 复制文件夹时的配置项，当文件夹有子文件时，请设置 recursive: true
   * @param mode 复制文件的模式
   * @returns Promise<void>
   */
  async cp(newPath: string, opt: CopyOptions, mode?: number): Promise<void> {
    if (this.isFile) {
      return copyFile(this.filePath, newPath, mode)
    } else {
      return cp(this.filePath, newPath, opt)
    }
  }

  /**
   * 写入文件，参数同 writeFile
   * @param content 写入内容
   * @param opt 写入选项
   * @returns Promise<void>
   */
  async write(content: WriteFileParams[1], opt?: WriteFileParams[2]): Promise<void> {
    return writeFile(this.filePath, content, opt)
  }

  /**
   * 删除文件或目录
   * @param opts 删除选项，当目录有子文件时，请设置 recursive: true
   * @returns Promise<void>
   */
  async rm(opts: RmOptions): Promise<void> {
    return rm(this.filePath, opts)
  }

  /**
   * 专门用于删除文件（不能删除目录）
   * @returns Promise<void>
   */
  async unlink(): Promise<void> {
    return unlink(this.filePath)
  }

  /**
   * 比较当前文件与另一个文件是否内容相同
   * @param otherFile 要比较的另一个文件
   * @returns Promise<boolean>
   */
  async isEqual(otherFile: JlFile): Promise<boolean> {
    // 如果两个路径指向同一个文件，则直接返回 true
    if (this.filePath === otherFile.filePath) {
      return true
    }

    // 如果其中一个不是文件，则不能比较内容
    if (!this.isFile || !otherFile.isFile) {
      return false
    }

    // 比较文件大小
    if (this.size !== otherFile.size) {
      return false
    }

    // 读取并比较文件内容
    const [content1, content2] = await Promise.all([
      this.getContent('utf-8'),
      otherFile.getContent('utf-8')
    ])

    return content1 === content2
  }

  /**
   * 设置文件权限
   * @param mode 权限模式
   * @returns Promise<void>
   */
  async setPermissions(mode: Mode): Promise<void> {
    return chmod(this.filePath, mode)
  }

  /**
   * 检查文件是否可读
   * @returns Promise<boolean>
   */
  async isReadable(): Promise<boolean> {
    try {
      await access(this.filePath, constants.R_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查文件是否可写
   * @returns Promise<boolean>
   */
  async isWritable(): Promise<boolean> {
    try {
      await access(this.filePath, constants.W_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查文件是否可执行
   * @returns Promise<boolean>
   */
  async isExecutable(): Promise<boolean> {
    try {
      await access(this.filePath, constants.X_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * 监听文件变化
   * @param callback 文件变化时的回调函数
   * @returns 停止监听的函数
   */
  watch(callback: (eventType: 'change' | 'rename', filename: string) => void): () => void {
    const watcher = watch(this.filePath, callback)
    return () => watcher.close()
  }

  /**
   * 计算文件的哈希值
   * @param algorithm 哈希算法 (如 'md5', 'sha1', 'sha256' 等)
   * @returns Promise<string> 哈希值的十六进制字符串
   */
  async getHash(algorithm: 'md5' | 'sha1' | 'sha256' | (string & {}) = 'sha256'): Promise<string> {
    if (!this.isFile) {
      throw new Error('Cannot calculate hash for directories')
    }

    const hash = createHash(algorithm)
    const stream = createReadStream(this.filePath)

    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }
}

/**
 * 把 JlFile 的子文件都添加上父级指针，并且一并放入数组返回
 * @param file JlFile 实例
 * @returns 包含父级指针的文件数组
 */
async function genFileArr(file: JlFile): Promise<JlFile[]> {
  const children = await file.getChildren()
  const newChildren = children.map((item) => {
    item.parent = file
    return item
  })

  return [
    file,
    ...newChildren
  ]
}
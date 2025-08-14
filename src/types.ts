import { mkdir, readFile, writeFile } from 'node:fs/promises'

/**
 * 文件写入选项类型
 */
export type WriteFileParams = Parameters<typeof writeFile>
/**
 * 创建文件夹参数
 */
export type CreateDirParams = Parameters<typeof mkdir>
/**
 * 读取文件参数
 */
export type ReadFileParams = Parameters<typeof readFile>

/**
 * 创建文件选项类型
 */
export type CreateFileOpts = {
  /**
   * 已存在文件时，是否删除重建
   * @default false
   */
  overwrite?: boolean
  /**
   * 文件夹不存在时，是否自动创建
   * @default true
   */
  autoCreateDir?: boolean
  writeFileOptions?: WriteFileParams[2]
}

/**
 * 创建文件夹选项
 */
export type CreateDirOpts = {
  /**
   * 已存在文件夹时，是否删除重建
   * @default false
   */
  overwrite?: boolean
  /**
   * 创建文件夹选项
   * @default
   * { recursive: true }
   */
  mkdirOptions?: CreateDirParams[1]
}

/**
 * 读取目录选项
 */
export type ReadDirOpts = {
  /**
   * 目录不存在时，是否自动创建
   * @default true
   */
  autoCreateDir?: boolean
}

/**
 * Append 方法选项
 */
export type AppendOpts = {
  /**
   * 文件不存在时，是否自动创建
   * @default true
   */
  autoCreate?: boolean
  /**
   * 是否在追加内容前添加换行符
   * @default false
   */
  newLine?: boolean
}

/**
 * 文件打开标志类型
 */
export type FileFlag =
  | 'a'    // 追加写入
  | 'ax'   // 追加写入（文件存在时失败）
  | 'a+'   // 读取和追加写入
  | 'ax+'  // 读取和追加写入（文件存在时失败）
  | 'as'   // 同步追加写入
  | 'as+'  // 同步读取和追加写入
  | 'r'    // 只读
  | 'r+'   // 读写
  | 'rs+'  // 同步读写（绕过缓存）
  | 'w'    // 写入（创建或截断）
  | 'wx'   // 写入（文件存在时失败）
  | 'w+'   // 读写（创建或截断）
  | 'wx+'  // 读写（文件存在时失败）
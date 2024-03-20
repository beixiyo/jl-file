import { resolve, basename, extname, dirname, join } from "node:path"
import { readFile, stat, mkdir, rmdir, readdir, rename, writeFile, rm, cp, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import type { CopyOptions, RmOptions } from 'node:fs'


/**
 * 请调用静态方法创建实例，因为是异步创建的，不能 new
 */
export class JlFile {
    /** 父级，只有调用 JlFile.getAllChildren，才会有值 */
    parent: null | JlFile = null

    private constructor(
        public filename: string,
        public name: string,
        public ext: string,
        public isFile: boolean,
        public size: number,
        public createTime: Date,
        public updateTime: Date
    ) { }

    /** ====================== 静态方法 ====================== */

    /** 异步创建文件实例 */
    static async genFile(filename: string) {
        const
            _stat = await stat(filename),
            name = basename(filename),
            ext = extname(filename),
            isFile = _stat.isFile(),
            size = _stat.size,
            createTime = new Date(_stat.birthtime),
            updateTime = new Date(_stat.mtime)

        return new JlFile(filename, name, ext, isFile, size, createTime, updateTime)
    }

    /** 读取子文件，同 JlFile.getChildren 方法，只不过改成静态方法 */
    static async readDir(dirname: string) {
        const file = await JlFile.genFile(dirname)
        return await file.getChildren()
    }

    /**
     * 创建文件夹
     * @param dirname 文件夹路径
     * @param isForce 已存在时，是否强制创建
     */
    static async createDir(dirname: string, isForce = false) {
        const isExist = await JlFile.isExist(dirname)
        if (isExist) {
            if (isForce) {
                await rmdir(dirname)
                mkdir(dirname, { recursive: true })
                return
            }

            throw new Error('dir is exist (文件夹已存在)')
        }

        mkdir(dirname, { recursive: true })
    }

    /**
     * 创建文件
     * @param filename 路径
     * @param content 创建时加入的内容
     * @param isForce 已存在时，是否强制创建
     */
    static async touch(filename: string, content = '', isForce = false) {
        const isExist = await JlFile.isExist(filename)
        if (isExist) {
            if (isForce) {
                await rm(filename, { recursive: true, force: true })
            }
            else {
                throw new Error('file is exist (文件已存在)')
            }
        }

        return writeFile(filename, content)
    }

    /** 是否存在 */
    static isExist(path: string) {
        return existsSync(path)
    }

    /** 深度递归获取所有子文件，每个文件对象都有父指针 */
    static async getAllChildren(filename: string) {
        const
            /** 存放重复文件夹映射关系 @example { 文件名: [index, ...], ... } */
            folderMap: any = {},
            { fileArr, folders } = await JlFile.getRepeatChildren(filename)

        folders.forEach((index) => {
            const name = fileArr[index].filename
            if (folderMap[name]) {
                folderMap[name].push(index)
            }
            else {
                folderMap[name] = [index]
            }
        })

        // 删除重复的文件夹
        let delCount = 0
        Object.entries(folderMap).forEach(([_k, indexArr]: any) => {
            // 说明没有重复
            if (indexArr.length === 1) return

            indexArr.slice(1).forEach((index: number) => {
                fileArr.splice(index - delCount++, 1)
            })
        })

        return fileArr
    }

    /**
     * 得到一个深度递归的文件数组，文件夹为重复的，所以这个方法不对外暴露。请调用 getAllChildren
     * @returns 重复的文件数组 和 重复索引的数组
     */
    private static async getRepeatChildren(
        filename: string,
        parent: JlFile | null | undefined = null,
        fileArr: JlFile[] = [],
        excludeSet = new Set<string>(),
        index = 0,
        folders = new Set<number>()
    ) {
        const myFile = await JlFile.genFile(filename)
        myFile.parent = parent

        if (myFile.isFile) {
            fileArr.push(myFile)
            excludeSet.add(filename)
            return { fileArr, folders }
        }

        excludeSet.add(filename)
        const childrenFileArr = await genFileArr(myFile)

        /** 便利子文件夹，加入排除数组和文件夹数组 */
        childrenFileArr.forEach((item) => {
            /** 添加所有子节点以及自身 */
            fileArr.push(item)

            /** 把添加过的 并且不是文件夹的排除 */
            if (item.isFile) {
                excludeSet.add(item.filename)
                index++
            }
            else {
                // 记录文件夹索引，因为会重复
                folders.add(index++)
            }
        })

        /** 递归子节点 */
        for (let i = 0; i < childrenFileArr.length; i++) {
            const item = childrenFileArr[i]
            if (excludeSet.has(item.filename)) {
                continue
            }

            await JlFile.getRepeatChildren(
                item.filename,
                myFile,
                fileArr,
                excludeSet,
                index,
                folders
            )
        }

        return { fileArr, folders }
    }

    /** ====================== 实例方法 ====================== */

    /**
     * 获取当前文件内容
     * @param isBuffer 使用 Buffer 读取
     */
    async getContent(isBuffer = false) {
        if (this.isFile) {
            if (isBuffer) {
                return await readFile(this.filename)
            }
            else {
                return await readFile(this.filename, "utf-8")
            }
        }
        return null
    }

    /** 递归获取当前文件实例所有内容的大小 */
    async getAllSize() {
        let size = 0
        const children = await JlFile.getAllChildren(this.filename)
        children.forEach((item) => {
            size += item.size
        })

        return size
    }

    /** 获取当前文件子级 */
    async getChildren() {
        if (this.isFile) {
            // 文件不可能有子文件
            return []
        }

        let children = await readdir(this.filename)
        return Promise.all(children.map(name => {
            const result = resolve(this.filename, name)
            return JlFile.genFile(result)
        }))
    }

    /** 重命名 */
    rename(newName: string) {
        const dir = dirname(this.filename)
        return rename(this.filename, join(dir, newName))
    }

    /** 移动 */
    move(newPath: string) {
        return rename(this.filename, newPath)
    }

    /**
     * 复制，会自动判断是否为文件夹
     * @param newPath 目标路径
     * @param opt 复制文件夹时的配置项，当文件夹有子文件时，请设置 recursive: true
     * @param mode 复制文件的模式
     */
    cp(newPath: string, opt: CopyOptions, mode?: number) {
        if (this.isFile) {
            return copyFile(this.filename, newPath, mode)
        }
        return cp(this.filename, newPath, opt)
    }

    /** 写入文件，参数同 writeFile */
    write(content: WriteType[1], opt?: writeOpt) {
        return writeFile(this.filename, content, opt)
    }

    /** 
     * 删除文件或文件夹
     * @param opt 当文件夹有子文件时，请设置 recursive: true
     */
    del(opt: RmOptions) {
        return rm(this.filename, opt)
    }
}

/** 把 MyFile 的子文件都添加上父级指针，并且一并放入数组返回 */
async function genFileArr(file: JlFile) {
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


type WriteType = Parameters<typeof writeFile>
type writeOpt = WriteType[2] & {
    flag: FileFlag
}

/**
 * 以下标志在 flag 选项接受字符串的任何地方可用。

    'a': 打开文件进行追加。 如果文件不存在，则创建该文件。

    'ax': 类似于 'a' 但如果路径存在则失败。

    'a+': 打开文件进行读取和追加。 如果文件不存在，则创建该文件。

    'ax+': 类似于 'a+' 但如果路径存在则失败。

    'as': 以同步模式打开文件进行追加。 如果文件不存在，则创建该文件。

    'as+': 以同步模式打开文件进行读取和追加。 如果文件不存在，则创建该文件。

    'r': 打开文件进行读取。 如果文件不存在，则会发生异常。

    'r+': 打开文件进行读写。 如果文件不存在，则会发生异常。

    'rs+': 以同步模式打开文件进行读写。 指示操作系统绕过本地文件系统缓存。

    这主要用于在 NFS 挂载上打开文件，因为它允许跳过可能过时的本地缓存。 它对 I/O 性能有非常实际的影响，因此除非需要，否则不建议使用此标志。

    这不会将 fs.open() 或 fsPromises.open() 变成同步阻塞调用。 如果需要同步操作，应该使用类似 fs.openSync() 的东西。

    'w': 打开文件进行写入。 创建（如果它不存在）或截断（如果它存在）该文件。

    'wx': 类似于 'w' 但如果路径存在则失败。

    'w+': 打开文件进行读写。 创建（如果它不存在）或截断（如果它存在）该文件。

    'wx+': 类似于 'w+' 但如果路径存在则失败。
 */
type FileFlag = 'a' | 'ax' | 'a+' | 'ax+' | 'as' | 'as+' | 'r' | 'r+' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+'
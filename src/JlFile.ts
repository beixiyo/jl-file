import { resolve, basename, extname, dirname, join } from "node:path"
import { readFile, stat, mkdir, rmdir, readdir, rename } from 'node:fs/promises'


export class JlFile {
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

    /** 读取子文件 */
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

    static async isExist(path: string) {
        try {
            await stat(path)
            return true
        }
        catch (err) {
            if (err.code === 'ENOENT') return false
            throw err
        }
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
        folders: number[] = []
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
                folders.push(index++)
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

    /** ====================== 静态方法 ====================== */


    /** 获取当前文件内容 */
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

    rename(newName: string) {
        const dir = dirname(this.filename)
        return rename(this.filename, join(dir, newName))
    }

    move(newPath: string) {
        return rename(this.filename, newPath)
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

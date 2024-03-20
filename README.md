# 介绍
一行代码，轻松递归遍历整个磁盘。包含各种常用文件操作


## 安装
```bash
npm i @jl-org/file
```

## 使用

```ts
import { JlFile } from '@jl-org/file'
import { resolve } from 'node:path'


const path = resolve(process.cwd(), './要查的路径');

(async function () {

    const
        /** 生成一个文件实例 */
        file = await JlFile.genFile(path),
        /** 查找当前实例的文件子级 */
        children = await file.getChildren(),

        /** 递归查找所有子文件(夹) */
        allChildren = await JlFile.getAllChildren(path),
        /** 递归查找当前路径所有文件大小 */
        allSize = await file.getAllSize()

    console.log(allChildren)
    console.log(allChildren.length)
    console.log(`${allSize}字节，约${(allSize / 1024 / 1024).toFixed(2)}MB`)

    // 详见下面类型定义...
})()
```

### 文件操作

```ts
/**
 * 请调用静态方法创建实例，因为是异步创建的，不能 new
 */
export declare class JlFile {
    filename: string;
    name: string;
    ext: string;
    isFile: boolean;
    size: number;
    createTime: Date;
    updateTime: Date;
    /** 父级，只有调用 JlFile.getAllChildren，才会有值 */
    parent: null | JlFile;

    /** ====================== 静态方法 ====================== */
    /** 异步创建文件实例 */
    static genFile(filename: string): Promise<JlFile>;
    /** 读取子文件，同 JlFile.getChildren 方法，只不过改成静态方法 */
    static readDir(dirname: string): Promise<JlFile[]>;
    /**
     * 创建文件夹
     * @param dirname 文件夹路径
     * @param isForce 已存在时，是否强制创建
     */
    static createDir(dirname: string, isForce?: boolean): Promise<void>;
    /**
     * 创建文件
     * @param filename 路径
     * @param content 创建时加入的内容
     * @param isForce 已存在时，是否强制创建
     */
    static touch(filename: string, content?: string, isForce?: boolean): Promise<void>;
    /** 是否存在 */
    static isExist(path: string): boolean;
    /** 深度递归获取所有子文件，每个文件对象都有父指针 */
    static getAllChildren(filename: string): Promise<JlFile[]>;

    /** ====================== 实例方法 ====================== */
    /**
     * 获取当前文件内容
     * @param isBuffer 使用 Buffer 读取
     */
    getContent(isBuffer?: boolean): Promise<string | Buffer>;
    /** 递归获取当前文件实例所有内容的大小 */
    getAllSize(): Promise<number>;
    /** 获取当前文件子级 */
    getChildren(): Promise<JlFile[]>;
    /** 重命名 */
    rename(newName: string): Promise<void>;
    /** 移动 */
    move(newPath: string): Promise<void>;
    /**
     * 复制，会自动判断是否为文件夹
     * @param newPath 目标路径
     * @param opt 复制文件夹时的配置项，当文件夹有子文件时，请设置 recursive: true
     * @param mode 复制文件的模式
     */
    cp(newPath: string, opt: CopyOptions, mode?: number): Promise<void>;
    /** 写入文件，参数同 writeFile */
    write(content: WriteType[1], opt?: writeOpt): Promise<void>;
    /**
     * 删除文件，会自动判断是文件还是文件夹
     * @param opt 当文件夹有子文件时，请设置 recursive: true
     */
    del(opt: RmOptions): Promise<void>;
}

type WriteType = Parameters<typeof writeFile>;
type writeOpt = WriteType[2] & {
    flag: FileFlag;
};
```

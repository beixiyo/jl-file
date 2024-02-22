# 介绍
文件处理函数。一行代码即可获取所有子级文件，以及各种常用文件操作。


## 安装
```bash
npm i @jl-org/file
```

## 使用

```ts
import { JlFile } from '@jl-org/file'
import { resolve } from 'node:path'


const path = resolve(__dirname, './');

(async function () {
    /** 生成一个文件实例 */
    const file = await JlFile.genFile(path),
        /** 查找当前实例的文件子级 */
        children = await file.getChildren(),
        /** 递归查找所有子文件(夹) */
        allChildren = await JlFile.getAllChildren(path)

    console.log(allChildren)
    console.log(allChildren.length)

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
    static isExist(path: string): Promise<boolean>;

    /** 深度递归获取所有子文件，每个文件对象都有父指针 */
    static getAllChildren(filename: string): Promise<JlFile[]>;

    /** ====================== ------- ====================== */

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

    /** 写入文件，参数同 writeFile */
    write(content: WriteType[1], opt?: writeOpt): Promise<void>;

    /** 删除文件 */
    del(opt: RmOptions): Promise<void>;
}
```

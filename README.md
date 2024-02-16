# 介绍
文件处理函数。一行代码即可获取所有子级文件，以及各种常用文件操作。


## 安装
```bash
npm i @jl-org/file
```

## 使用

```ts
const { JlFile } = require("@jl-org/file")
const { resolve } = require("node:path")


const pathName = resolve(__dirname, "./myfiles");

(async () => {
    /** 创建文件实例 */
    const file = await JlFile.genFile(pathName)
    /** 深度递归获取所有子文件 */
    const allFileArr = await JlFile.getAllChildren(pathName)

    // ... 详见下面类型定义
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
    parent: null | JlFile;
    
    /** ====================== 静态方法 ====================== */

    /** 异步创建文件实例 */
    static genFile(filename: string): Promise<JlFile>;

    /** 读取子文件 */
    static readDir(dirname: string): Promise<JlFile[]>;

    /**
     * 创建文件夹
     * @param dirname 文件夹路径
     * @param isForce 已存在时，是否强制创建
     */
    static createDir(dirname: string, isForce?: boolean): Promise<void>;

    /** 是否存在 */
    static isExist(path: string): Promise<boolean>;

    /** 深度递归获取所有子文件，每个文件对象都有父指针 */
    static getAllChildren(filename: string): Promise<JlFile[]>;
    /** ====================== ------- ====================== */
    
    /** 获取当前文件内容 */
    getContent(isBuffer?: boolean): Promise<string | Buffer>;

    /** 获取当前文件子级 */
    getChildren(): Promise<JlFile[]>;

    /** 重命名 */
    rename(newName: string): Promise<void>;

    /** 移动 */
    move(newPath: string): Promise<void>;
}
```

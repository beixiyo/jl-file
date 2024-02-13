# 介绍
文件处理函数


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
    const file = await JlFile.genFile(pathName)

    const allFileArr = await JlFile.getAllChildren(pathName)

    // ... 详见下面类型定义
})()
```

### 文件操作

```ts
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

    static isExist(path: string): Promise<boolean>;

    /** 深度递归获取所有子文件，每个文件对象都有父指针 */
    static getAllChildren(filename: string): Promise<JlFile[]>;
    /**
     * 得到一个深度递归的文件数组，文件夹为重复的，所以这个方法不对外暴露。请调用 getAllChildren
     * @returns 重复的文件数组 和 重复索引的数组
     */
    /** ====================== 静态方法 ====================== */


    /** 获取当前文件内容 */
    getContent(isBuffer?: boolean): Promise<string | Buffer>;

    /** 获取当前文件子级 */
    getChildren(): Promise<JlFile[]>;

    rename(newName: string): Promise<void>;
    
    move(newPath: string): Promise<void>;
}

```

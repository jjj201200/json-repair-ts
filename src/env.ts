/**
 * 环境检测和 fs 模块兼容层
 * 支持 Node.js 和浏览器环境
 */

// 检测当前运行环境
export const isNode = typeof process !== 'undefined'
  && (process as any).versions != null
  && (process as any).versions.node != null;

export const isBrowser = typeof globalThis !== 'undefined'
  && typeof (globalThis as any).window !== 'undefined'
  && typeof (globalThis as any).window.document !== 'undefined';

// fs 模块接口定义
export interface FsModule {
  readFileSync(path: string, encoding: BufferEncoding): string;
  openSync(path: string, flags: string): number;
  closeSync(fd: number): void;
}

// 延迟加载 fs 模块(仅在 Node.js 环境)
let fsModule: FsModule | null = null;
let fsModuleLoaded = false;

function loadFsModule(): FsModule | null {
  if (fsModuleLoaded) {
    return fsModule;
  }

  fsModuleLoaded = true;

  if (isNode) {
    try {
      // 在 Node.js 环境下使用 require 同步加载
      // @ts-ignore - 在浏览器构建时会被替换
      fsModule = require('fs');
    } catch (e) {
      console.warn('Failed to load fs module:', e);
      fsModule = null;
    }
  }

  return fsModule;
}

// 导出兼容的 fs 函数
export const fs = {
  readFileSync: (path: string, encoding: BufferEncoding): string => {
    const fs = loadFsModule();
    if (!fs) {
      throw new Error('File system operations are not available in browser environment. Use repairJson() with string input instead.');
    }
    return fs.readFileSync(path, encoding);
  },

  openSync: (path: string, flags: string): number => {
    const fs = loadFsModule();
    if (!fs) {
      throw new Error('File system operations are not available in browser environment. Use repairJson() with string input instead.');
    }
    return fs.openSync(path, flags);
  },

  closeSync: (fd: number): void => {
    const fs = loadFsModule();
    if (!fs) {
      throw new Error('File system operations are not available in browser environment.');
    }
    return fs.closeSync(fd);
  }
};

// 检查文件系统功能是否可用
export const hasFileSystemSupport = (): boolean => {
  return loadFsModule() !== null;
};

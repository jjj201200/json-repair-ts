// 使用 esbuild 打包成浏览器可用的各种格式
const esbuild = require('esbuild');
const fs = require('fs');

// 创建 fs 模块替换插件
const fsStubPlugin = {
  name: 'fs-stub',
  setup(build) {
    // 拦截对 fs 模块的引用
    build.onResolve({ filter: /^fs$/ }, args => {
      return { path: args.path, namespace: 'fs-stub' }
    })
    // 提供空的 fs 模块实现
    build.onLoad({ filter: /.*/, namespace: 'fs-stub' }, () => {
      return {
        contents: `
          export default {};
          export const readFileSync = () => {
            throw new Error("fs is not available in browser");
          };
          export const readSync = () => {
            throw new Error("fs is not available in browser");
          };
          export const openSync = () => {
            throw new Error("fs is not available in browser");
          };
          export const closeSync = () => {
            throw new Error("fs is not available in browser");
          };
        `,
        loader: 'js',
      }
    })
  }
};

// 构建所有格式
async function buildAll() {
  try {
    // 1. IIFE 格式 - 浏览器全局变量
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      format: 'iife',
      target: ['es2020'],
      globalName: 'JsonRepair',
      outfile: 'dist/json-repair.bundle.js',
      platform: 'neutral',
      plugins: [fsStubPlugin],
    });
    console.log('✅ 浏览器 IIFE 格式已生成: dist/json-repair.bundle.js');

    // 2. CJS 格式用于 Node.js
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      format: 'cjs',
      target: ['es2020'],
      outfile: 'dist/json-repair.cjs.temp.js',
      platform: 'neutral',
      plugins: [fsStubPlugin],
    });
    console.log('✅ 临时 CJS 格式已生成');

    // 3. 基于 CJS 和 IIFE 创建 UMD 格式
    const cjsContent = fs.readFileSync('dist/json-repair.cjs.temp.js', 'utf-8');
    const iifeContent = fs.readFileSync('dist/json-repair.bundle.js', 'utf-8');

    // UMD wrapper
    const umdContent = `(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // CommonJS - 直接使用 CJS 版本的代码
    ${cjsContent}
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function() {
      ${iifeContent}
      return JsonRepair;
    });
  } else {
    // Browser globals - IIFE 已经设置了全局 JsonRepair
    ${iifeContent}
  }
}(typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync('dist/json-repair.umd.js', umdContent);
    fs.unlinkSync('dist/json-repair.cjs.temp.js'); // 删除临时文件
    console.log('✅ UMD 格式已生成: dist/json-repair.umd.js');

    // 4. ESM 格式 - 现代浏览器 <script type="module">
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      format: 'esm',
      target: ['es2020'],
      outfile: 'dist/json-repair.esm.js',
      platform: 'neutral',
      plugins: [fsStubPlugin],
    });
    console.log('✅ 浏览器 ESM 格式已生成: dist/json-repair.esm.js');

    // 5. 压缩版本 - IIFE minified
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      format: 'iife',
      target: ['es2020'],
      globalName: 'JsonRepair',
      outfile: 'dist/json-repair.min.js',
      platform: 'neutral',
      plugins: [fsStubPlugin],
      minify: true,
    });
    console.log('✅ IIFE 压缩版已生成: dist/json-repair.min.js');

    // 6. CJS 压缩版用于 UMD
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      format: 'cjs',
      target: ['es2020'],
      outfile: 'dist/json-repair.cjs.min.temp.js',
      platform: 'neutral',
      plugins: [fsStubPlugin],
      minify: true,
    });

    // 7. 基于压缩的 CJS 和 IIFE 创建 UMD 压缩版
    const cjsMinContent = fs.readFileSync('dist/json-repair.cjs.min.temp.js', 'utf-8');
    const iifeMinContent = fs.readFileSync('dist/json-repair.min.js', 'utf-8');
    const umdMinContent = `(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    ${cjsMinContent}
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      ${iifeMinContent}
      return JsonRepair;
    });
  } else {
    ${iifeMinContent}
  }
}(typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync('dist/json-repair.umd.min.js', umdMinContent);
    fs.unlinkSync('dist/json-repair.cjs.min.temp.js'); // 删除临时文件
    console.log('✅ UMD 压缩版已生成: dist/json-repair.umd.min.js');

    console.log('\n🎉 所有浏览器构建格式已生成完毕!');
  } catch (e) {
    console.error('❌ 构建失败:', e);
    process.exit(1);
  }
}

buildAll();

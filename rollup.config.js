import { defineConfig } from 'rollup'
import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias'
import clear from 'rollup-plugin-clear'
import { fileURLToPath } from 'node:url'


export default defineConfig({
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs', format: 'cjs' },
    { file: 'dist/index.js', format: 'es' },
  ],
  plugins: [
    nodeResolve(),  // 开启`node_modules`查找模块功能
    terser(),
    typescript(),
    clear({
      targets: ['dist'],
      watch: true,
    }),

    alias({
      entries: [
        {
          find: '@',
          replacement: fileURLToPath(
            new URL('src', import.meta.url)
          )
        },
      ]
    }),
  ],
})

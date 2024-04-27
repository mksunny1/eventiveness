import dts from 'rollup-plugin-dts'
import copy from 'rollup-plugin-copy'
import typescript from '@rollup/plugin-typescript';

import { writeFile, mkdir } from 'fs/promises'

function createCommonJsPackage() {
  const pkg = { type: 'commonjs' }
  return {
    name: 'cjs-package',
    buildEnd: async () => {
      await mkdir('./dist/cjs', { recursive: true })
      await writeFile('./dist/cjs/package.json', JSON.stringify(pkg, null, 2))
    }
  }
}

export default [
    {
      input: ['./src/domitory.ts', './src/appliance.ts', './src/actribute.ts', './src/apriori.ts', './src/generational.ts', './src/sophistry.ts', './src/onetomany.ts'],
      plugins: [
        typescript(),
        copy({
          targets: [
            { src: './package.json', dest: 'dist' }
          ]
        }),
        createCommonJsPackage(),
        // terser()
      ],
      output: [
        { format: 'es', dir: './dist/esm' },
        { format: 'cjs', dir: './dist/cjs' }
      ]
    },
    {
      input:  './src/eventiveness.ts', // ['./src/domitory.ts', './src/appliance.ts', './src/actribute.ts', './src/apriori.ts', './src/generational.ts', './src/sophistry.ts', './src/onetomany.ts'],
      plugins: [ dts() ],
      output: {
        format: 'es',
        file: './dist/eventiveness.d.ts' 
      }
    }
  ]
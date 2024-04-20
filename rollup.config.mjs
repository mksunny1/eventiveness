import dts from 'rollup-plugin-dts'
import copy from 'rollup-plugin-copy'
import terser from '@rollup/plugin-terser';

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
      input: ['./src/domitory.js', './src/appliance.js', './src/actribute.js', './src/apriori.js', './src/generational.js', './src/sophistry.js', './src/onetomany.js', './src/eventiveness.js'],
      plugins: [
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
    /* {
      input:  './src/eventiveness.js',  // ['./src/arender.js', './src/apriori.js', './src/sophistry.js', './src/eventivity.js', './src/domitory.js', './src/actribute.js'],
      plugins: [ dts() ],
      output: {
        format: 'es',
        file: './dist/eventiveness.d.ts' 
      }
    } */
  ]
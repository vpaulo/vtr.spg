import typescript from '@rollup/plugin-typescript';
import pkg from '../package.json';

export default {
    input: 'public/js/main.ts',
    output: {
        file: pkg.module,
        format: 'es',
        sourcemap: false,
        strict: true,
        inlineDynamicImports: true,
        banner: '(() => {',
        footer: '})();'
    },
    plugins: [
        typescript(),
    ],
}

// Transpile programatically
// const ts = require('typescript');
// ts.transpileModule(ts.sys.readFile(filePath), {compilerOptions: {module: ts.ModuleKind.CommonJS}});
import typescript from '@rollup/plugin-typescript';
import pkg from '../package.json'

export default {
    input: 'public/js/main.ts',
    output: {
        file: pkg.main,
        format: 'cjs',
        sourcemap: false,
        strict: true,
        inlineDynamicImports: true,
        banner: '(function() {',
        footer: '})();'
    },
    plugins: [
        typescript({lib: ["es5", "es6", "dom"], target: "es5"}),
    ],
}

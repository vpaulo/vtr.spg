import { writeFile } from './writeFile.js';
import fs from 'fs';
import terser from 'terser';
import less from 'less';
import postcss from 'postcss';
import clean from 'cssnano';
import autoprefixer from 'autoprefixer';

const prefixer = postcss([autoprefixer(), clean({ preset: 'default' })]);
const scripts = [
    'static/js/main.js',
    'static/js/main.es.js'
];
const styles = [
    'public/css/styles.less',
    'public/css/styles.dark.less'
];

function minifyScript(path) {
    const script = fs.readFileSync(path).toString();
    const flags = {
        parse: {},
        compress: false,
        mangle: true,
        output: {
            ast: true,
            code: true,
            keep_quoted_props: true,
        },
        toplevel: true,
    };

    return terser.minify(script, flags).code;
}

export async function jsLibs() {
    console.time('JS minify');
    scripts.forEach(lib => {
        const script = minifyScript(lib);
        // Create minified script
        writeFile(lib.replace('.js', '.min.js'), script);
    });
    console.timeEnd('JS minify');
};

export async function cssLibs() {
    console.time('CSS minify');
    styles.forEach(async (style) => {
        const contents = fs.readFileSync(style).toString();
        const output = await less.render(contents, { lint: true });
        const result = await prefixer.process(output.css, { from: undefined });
        // Create minified styles
        writeFile(style.replace('public/', 'static/').replace('.less', '.css'), result.css);
    });
    console.timeEnd('CSS minify');
};
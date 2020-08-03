const fs = require('fs');
const pkg = require('./package.json');
const getDirName = require('path').dirname;

const nunjucks = require('nunjucks');
const mkdirp = require('mkdirp');
const terser = require('terser');
const less = require('less');
const postcss = require('postcss');
const clean = require('cssnano');
const autoprefixer = require('autoprefixer');
const minifier = require('html-minifier');

const prefixer = postcss([autoprefixer(), clean({ preset: 'default' })]);
const htmlMinifierOptions = {
    removeComments: true,
    collapseWhitespace: true
};

const buildPages = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const file = dir + f;

        if (fs.statSync(file).isDirectory()) {
            buildPages(`${file}/`, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push({ path: dir, name: f });
        }
    });
    return fileList;
};

function writeFile(path, content) {
    mkdirp.sync(getDirName(path));
    fs.writeFileSync(path, content);
}

async function getSyles(theme = '') {
    console.log('Theme: ', theme);
    const contents = fs.readFileSync(`./www/css/styles${theme === '' ? '' : `.${theme}`}.less`).toString();
    const output = await less.render(contents, { lint: true });
    const result = await prefixer.process(output.css, { from: undefined });
    return result.css;
}

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

(async () => {
    console.time('Create');
    const scriptMain = minifyScript(pkg.main);
    const scriptModule = minifyScript(pkg.module);

    // Create minified scripts
    writeFile(pkg.main.replace('.js', '.min.js'), scriptMain);
    writeFile(pkg.module.replace('.js', '.min.js'), scriptModule);

    buildPages('./www/').forEach(async file => {
        console.log(`Path: ${file.path} - Name: ${file.name}`);
        const staticPath = `./static${file.path.replace('./www', '')}`;
        const config = file.name.replace('.html', '.json');
        const options = require(`${file.path + config}`);
        options.styles = await getSyles(options.theme);

        // CONTENT
        nunjucks.render(`${file.path + file.name}`, options, (err, res) => {
            const html = minifier.minify(res, htmlMinifierOptions);
            writeFile(`${staticPath + file.name}`, html);
        });
    });
    
    console.timeEnd('Create');
})();
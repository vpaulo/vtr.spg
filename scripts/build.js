import { writeFile } from './writeFile.js';
import { jsLibs, cssLibs } from './publicBuild.js';
import fs from 'fs';

import nunjucks from 'nunjucks';
import minifier from 'html-minifier';

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
        } else if (file.endsWith('.json')) {
            fileList.push({ path: dir, name: f });
        }
    });
    return fileList;
};

(async () => {
    console.time('Create');

    jsLibs();
    cssLibs();

    buildPages('./pages/').forEach(async file => {
        console.log(`Path: ${file.path} - Name: ${file.name}`);
        const staticPath = `./static${file.path.replace('./pages', '')}`;
        const staticFile = file.name.replace('.json', '.html');
        const options = JSON.parse(fs.readFileSync(`${file.path + file.name}`).toString());

        // CONTENT
        nunjucks.render(`./templates/${options.template}`, options, (err, res) => {
            if (err) {
                console.log('Error: failed to render page - ', err);
                return;
            }
            const html = minifier.minify(res, htmlMinifierOptions);
            writeFile(`${staticPath + staticFile}`, html);
        });
    });
    
    console.timeEnd('Create');
})();
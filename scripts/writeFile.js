import fs from 'fs';
import mkdirp from 'mkdirp';
import {dirname} from 'path';

export function writeFile(path, content) {
    mkdirp.sync(dirname(path));
    fs.writeFileSync(path, content);
}
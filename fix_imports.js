const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('./src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.match(/\.(ts|tsx)$/)) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    content = content.replace(/from\s+['"]((?:\.\.\/)+)([^'"]+)['"]/g, (match, upDirs, rest) => {
        const fileDir = path.dirname(file);
        const targetPath = path.resolve(fileDir, upDirs, rest);
        const relativeToSrc = path.relative(srcDir, targetPath).replace(/\\/g, '/');
        if (!relativeToSrc.startsWith('..')) {
            changed = true;
            return `from '@/${relativeToSrc}'`;
        }
        return match;
    });
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Imports fixed.');

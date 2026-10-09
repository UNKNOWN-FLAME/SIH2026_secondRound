const fs = require('fs');
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('./src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // If line contains {Boolean(...) and then a bunch of garbage ending in (
    if (lines[i].includes('{Boolean(')) {
       lines[i] = lines[i].replace(/\{Boolean\((.*?)\).*\($/, '{Boolean($1) && (');
    }
    // Handle the inline span ones
    if (lines[i].includes('&& <span') && lines[i].includes('{Boolean(')) {
       lines[i] = lines[i].replace(/\{Boolean\((.*?)\).*?<span/, '{Boolean($1) && <span');
    }
  }
  fs.writeFileSync(file, lines.join('\n'));
}

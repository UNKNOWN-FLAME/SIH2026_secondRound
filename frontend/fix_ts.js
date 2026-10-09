const fs = require('fs');
const glob = require('glob'); // npm install glob if needed, but I'll just use fs.readdirSync recursively
const path = require('path');

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
  
  // Clean up the messed up replacements first
  content = content.replace(/\{Boolean\([^)]+\)\s*\{[^}]+\}\s*\(\{[^}]+\}\s*\(\s*\(/g, match => {
     // match example: {Boolean(opp.corporate_match_suggestions) {opp.corporate_match_suggestions && ({opp.corporate_match_suggestions && ( (
     const m = match.match(/\{Boolean\(([^)]+)\)/);
     return `{Boolean(${m[1]}) && (`;
  });
  
  // Clean up any remaining bad substitutions for && <span
  content = content.replace(/\{Boolean\([^)]+\)\s*\\\&\\\&\s*<span/g, match => {
     const m = match.match(/\{Boolean\(([^)]+)\)/);
     return `{Boolean(${m[1]}) && <span`;
  });

  fs.writeFileSync(file, content);
}

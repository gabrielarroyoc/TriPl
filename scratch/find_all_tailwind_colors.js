import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(fullPath);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const match = line.match(/\b(bg|text|border|ring|shadow|from|to|via)-([a-z]+)-([0-9]+)\b/g);
          if (match) {
            console.log(`${file}:${idx+1}: ${match.join(', ')}`);
          }
        });
      }
    }
  });
}

searchDir('C:/Users/gabri/projetos/tripe/src');

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
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.match(/#[0-9a-fA-F]{3,8}\b/g);
        if (matches) {
          console.log(`${fullPath}: ${[...new Set(matches)].join(', ')}`);
        }
      }
    }
  });
}

searchDir('C:/Users/gabri/projetos/tripe/src');

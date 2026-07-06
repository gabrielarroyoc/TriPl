import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('bg-') || line.includes('text-')) {
            // Check if it has color related tailwind classes
            const words = line.match(/\b(bg|text)-[a-z]+-[0-9]+\b/g);
            if (words) {
              console.log(`${file}:${idx+1}: ${words.join(', ')}`);
            }
          }
        });
      }
    }
  });
}

searchDir('C:/Users/gabri/projetos/tripe/src/pages');

import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync('C:/Users/gabri/projetos/tripe/src/pages/Planner.tsx', 'utf8');
const lines = fileContent.split('\n');
lines.forEach((line, index) => {
  if (line.includes('handleShare') || line.includes('Share') || line.includes('share')) {
    console.log(`${index + 1}: ${line}`);
  }
});

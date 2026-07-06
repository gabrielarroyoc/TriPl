import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync('C:/Users/gabri/projetos/tripe/src/pages/Planner.tsx', 'utf8');
const lines = fileContent.split('\n');
lines.forEach((line, index) => {
  if (line.includes('getIntensityInfo') || line.includes('intensity')) {
    console.log(`${index + 1}: ${line}`);
  }
});

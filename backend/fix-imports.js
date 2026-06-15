const fs = require('fs');
const path = require('path');

function find(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(find(file));
    } else {
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = find('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes("import { Role } from '@prisma/client';")) {
    const depth = f.split('/').length - 3; // ./src/something.ts is depth 0. ./src/users/users.ts is depth 1.
    const prefix = depth === 0 ? './' : '../'.repeat(depth);
    content = content.replace("import { Role } from '@prisma/client';", `import { Role } from '${prefix}role.enum';`);
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});

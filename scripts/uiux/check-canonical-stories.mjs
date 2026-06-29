#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=process.cwd();
const git=(args)=>{try{return execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim()}catch{return ''}};
const files=new Set([
  ...git(['diff','--name-only','HEAD']).split('\n'),
  ...git(['ls-files','--others','--exclude-standard']).split('\n'),
].filter(Boolean));
const canonical=[...files].filter(f => /^packages\/frontend\/src\/(?:design-system|components\/ui)\/.*\.tsx$/.test(f) && !/\.(?:stories|test|spec)\.tsx$/.test(f));
const failures=[];
for(const file of canonical){
  const base=file.replace(/\.tsx$/, '');
  const candidates=[`${base}.stories.tsx`, `${base}.story.tsx`];
  if(!candidates.some(c=>fs.existsSync(path.join(root,c)))) failures.push(`${file}: canonical component requires a sibling Storybook story.`);
}
if(failures.length){console.error('Story coverage failures:\n'+failures.map(x=>`  - ${x}`).join('\n'));process.exit(1)}
console.log(`Canonical Storybook coverage passed for ${canonical.length} changed component(s).`);

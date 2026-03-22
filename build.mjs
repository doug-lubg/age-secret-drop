import { build } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const publicDir = path.join(root, 'public');
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');

await mkdir(distDir, { recursive: true });
await cp(publicDir, distDir, { recursive: true });

await build({
  entryPoints: [path.join(srcDir, 'main.js')],
  outfile: path.join(distDir, 'app.js'),
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
});

await build({
  entryPoints: ['age-encryption'],
  outfile: path.join(distDir, 'age.js'),
  bundle: true,
  format: 'iife',
  globalName: 'age',
  target: 'es2022',
  minify: true,
});

console.log(`Built ${distDir}`);

// scripts/convert-images.js
import sharp from 'sharp'
import { readdirSync } from 'fs'
import path from 'path'

const dir = './src/assets'
const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f))

for (const file of files) {
  const input = path.join(dir, file)
  const base = file.replace(/\.(jpg|jpeg|png)$/i, '')

  await sharp(input).webp({ quality: 80 }).toFile(path.join(dir, `${base}.webp`))
  await sharp(input).avif({ quality: 60 }).toFile(path.join(dir, `${base}.avif`))
}
console.log('Done:', files)
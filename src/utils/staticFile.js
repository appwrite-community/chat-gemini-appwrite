import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

/* Use this in place of __dirname in an ES module */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticFolder = path.join(__dirname, '../../static')

/* Function to read and return the content of a static HTML file */
export function getStaticFile(fileName) {
  return fs.readFileSync(path.join(staticFolder, fileName)).toString()
}

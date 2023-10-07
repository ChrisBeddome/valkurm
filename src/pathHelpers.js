import path from 'path'
import url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const __approot = process.cwd()

export {__dirname, __approot}

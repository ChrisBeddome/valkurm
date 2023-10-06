import path from 'path'
import url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const __approot = path.resolve(__dirname).split('node_modules')[0]

export {__dirname, __approot}

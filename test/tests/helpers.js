import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'

const deleteMigrationsDirectory = () => {
  const dirpath = new URL('../migrations/', import.meta.url);
  fs.rmSync(dirpath, {recursive: true})
}

const deleteGlobalConfig = () => {
  const filepath = new URL('../valkurmConfig.js', import.meta.url);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
  }
}

const restoreGlobalConfig = () => {
  const sourceFilepath = new URL('../valkurmConfig.js.backup', import.meta.url);
  const destFilepath = new URL('../valkurmConfig.js', import.meta.url);
  fs.copyFileSync(sourceFilepath, destFilepath)
}

const runCommand = command => {
  let output = {}, exitCode
  try {
    output.stdout = execSync(command).toString()
  } 
  catch (error) {
    output.stderr = error.stderr.toString()
    exitCode = error.status
  }
  return [output, exitCode]
}

export {runCommand, restoreGlobalConfig, deleteGlobalConfig, deleteMigrationsDirectory}

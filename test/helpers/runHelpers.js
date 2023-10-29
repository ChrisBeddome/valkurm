import {execSync} from 'child_process'

const runCommand = command => {
  let output = {stdout: '', stderr: ''}, exitCode
  try {
    output.stdout = execSync(command).toString()
  } 
  catch (error) {
    output.stderr = error.stderr.toString()
    exitCode = error.status
  }
  return [output, exitCode]
}

export {
  runCommand
}

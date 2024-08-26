#!/usr/bin/env node
const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const childProcess = require('child_process')
const askQuestion = require('./ask-question.js')

const exec = promisify(childProcess.exec)
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)
const cp = promisify(fs.cp)

/*
 * calculate project directory name
 */
const defaultFolderName = 'my-express-app'
const initWorkingDirectory = process.cwd()

let folderName = defaultFolderName
if (process.argv.slice(2).length > 0) {
  folderName = process.argv.slice(2)[0]
}
const projectWorkingDirectory = join(initWorkingDirectory, folderName)
/* #### END #### */

async function main () {
  /*
   * make new directory and move into it
   */
  console.log(`creating directory ${folderName}`)
  await mkdir(projectWorkingDirectory)
  process.chdir(projectWorkingDirectory)
  /* #### END #### */

  /*
   * initialize npm in new project directory
   */
  console.log('npm init')
  await exec('npm init --yes')
  /* #### END #### */

  /*
   * create and set package main
   */
  console.log('creating src directory')
  await mkdir(join(projectWorkingDirectory, 'src'))

  console.log('copying src directory')
  await cp(join(__dirname, '..', 'src'), join(projectWorkingDirectory, 'src'), {
    recursive: true
  })

  console.log('updating main in package.json')
  await exec('npm pkg set main=./src/index.js')

  console.log('adding start to scripts in package.json')
  await exec('npm pkg set scripts.start="node ."')

  console.log('adding alias for routes')
  await exec('npm pkg set dependencies.~routes=file:./src/routes')

  console.log('adding alias for utils')
  await exec('npm pkg set dependencies.~utils=file:./src/utils')
  /* #### END #### */

  /*
   * set up ESLint
   */
  // console.log('installing ESLint (this may take a while)');
  // await exec("npm install --save-dev eslint @eslint/js");
  console.log('installing Standard ESLint config (this may take a while)')
  await exec('npm install --save-dev eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-n')

  console.log('writing .eslintrc file')
  await writeFile(join(projectWorkingDirectory, '.eslintrc'), `{
  "extends": "standard"
}`)

  console.log('writing .eslintignore file')
  await writeFile(join(projectWorkingDirectory, '.eslintignore'), 'test')

  console.log('adding lint to scripts in package.json')
  await exec('npm pkg set scripts.lint="eslint --fix ./src/**/*.{js,jsx,ts}"')

  console.log('adding prestart to scripts in package.json')
  await exec('npm pkg set scripts.prestart="npm run lint"')
  /* #### END #### */

  /*
   * install dotENV
   */
  console.log('installing dotENV (this may take a while)')
  await exec('npm install dotenv')

  console.log('writing .env file')
  await writeFile(join(projectWorkingDirectory, '.env'), 'PORT=8080')
  /* #### END #### */

  /*
   * install Winston
   */
  console.log('installing Winston (this may take a while)')
  await exec('npm install winston')
  /* #### END #### */

  /*
   * install Express
   */
  console.log('installing ExpressJS (this may take a while)')
  await exec('npm install express')

  console.log('installing uuid (this may take a while)')
  await exec('npm install uuid')

  console.log('installing Morgan (this may take a while)')
  await exec('npm install morgan')
  /* #### END #### */

  /*
   * install Swagger-JSDoc
   */
  console.log('installing swagger-jsdoc (this may take a while)')
  await exec('npm install swagger-jsdoc')

  /*
   * install Mocha
   */
  console.log('installing Mocha (this may take a while)')
  await exec('npm install --save-dev mocha')

  console.log('installing node-mocks-http (this may take a while)')
  await exec('npm install --save-dev node-mocks-http')

  console.log('copying test directory')
  await cp(join(__dirname, '..', 'test'), join(projectWorkingDirectory, 'test'), {
    recursive: true
  })

  console.log('adding test to scripts in package.json')
  await exec('npm pkg set scripts.test=mocha')
  /* #### END #### */

  /*
   * initialize and configure git
   * ALWAYS goes last
   */
  const usingGit = !!(
    await askQuestion('Are you using git (Y/n)? ', 'y', (a) => a.trim().match(/^(y|n|yes|no)$/i) ? true : 'Please enter y or n')
  ).trim().match(/^(y|yes)$/i)
  if (usingGit) {
    const gitUrl = await askQuestion('What is the URL for your Git repo? ')
    console.log('setting package repository')
    await exec('npm pkg set repository.type=git')
    await exec(`npm pkg set repository.url=git+${gitUrl}`)

    console.log('adding node gitignore')
    await exec('npx gitignore node')

    console.log('git init')
    await exec('git init')

    console.log('initial commit')
    await exec('git add --all')
    await exec('git commit -m "initial commit"')

    console.log('adding git remote origin')
    await exec(`git remote add origin ${gitUrl}`)
  }
  /* #### END #### */
}

main()
  .catch((err) => console.log('Error', err))
  .then(() => {
    console.log('Done')
    process.exit(0)
  })

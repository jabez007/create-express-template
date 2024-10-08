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
  await exec('npm pkg set scripts.start="node -r dotenv/config ."')
  /* #### END #### */

  /*
   * install module-alias
   */
  console.log('installing Module Alias (this may take a while)')
  await exec('npm install module-alias')

  console.log('adding alias for src')
  await exec('npm pkg set _moduleAliases.@=./src')

  console.log('adding alias for utils')
  await exec('npm pkg set _moduleAliases.@utils=./src/utils')

  console.log('adding alias for routes')
  await exec('npm pkg set _moduleAliases.@routes=./src/routes')

  console.log('adding alias for models')
  await exec('npm pkg set _moduleAliases.@models=./src/models')

  console.log('adding alias for services')
  await exec('npm pkg set _moduleAliases.@services=./src/connections/services')

  console.log('adding alias for databases')
  await exec('npm pkg set _moduleAliases.@databases=./src/connections/databases')

  /* #### END #### */

  /*
   * install dotENV
   */
  console.log('installing dotENV (this may take a while)')
  await exec('npm install --save-dev dotenv')

  console.log('writing .env file')
  await writeFile(join(projectWorkingDirectory, '.env'), 'PORT=8080')

  console.log('copying development .env file')
  await cp(join(__dirname, '..', '.env.development'), join(projectWorkingDirectory, '.env.development'))
  /* #### END #### */

  /*
   * install Winston
   */
  console.log('installing Winston (this may take a while)')
  await exec('npm install winston')

  console.log('installing uuid (this may take a while)')
  await exec('npm install uuid')

  console.log('installing Short Unique Id (this may take a while)')
  await exec('npm install short-unique-id')
  /* #### END #### */

  /*
   * set up ESLint
   */
  // console.log('installing ESLint (this may take a while)');
  // await exec("npm install --save-dev eslint @eslint/js");
  console.log('installing Standard ESLint config (this may take a while)')
  await exec('npm install --save-dev eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-n')

  console.log('copying eslintrc file')
  await cp(join(__dirname, '..', '.eslintrc'), join(projectWorkingDirectory, '.eslintrc'))

  console.log('writing eslintignore file')
  await writeFile(join(projectWorkingDirectory, '.eslintignore'), 'node_modules')

  console.log('adding lint to scripts in package.json')
  await exec('npm pkg set scripts.lint="eslint --fix \'./src/**/*.{js,jsx,ts}\'"')

  console.log('adding prestart to scripts in package.json')
  await exec('npm pkg set scripts.prestart="npm run lint"')
  /* #### END #### */

  /*
   * install Axios
   */
  console.log('installing Axios (this may take a while)')
  await exec('npm install axios')
  /* #### END #### */

  /*
   * install Express
   */
  console.log('installing ExpressJS (this may take a while)')
  await exec('npm install express')

  console.log('installing Morgan (this may take a while)')
  await exec('npm install morgan')
  /* #### END #### */

  /*
   * install nodemon
   */
  console.log('installing nodemon (this may take a while)')
  await exec('npm install --save-dev nodemon')

  console.log('adding serve to scripts in package.json')
  await exec('npm pkg set scripts.serve="nodemon --watch src -e js,jsx --exec npm run start"')
  /* #### END #### */

  /*
   * install Swagger/OpenAPI
   */
  console.log('installing Swagger JSdoc (this may take a while)')
  await exec('npm install swagger-jsdoc')

  console.log('installing Swagger Parser (this may take a while)')
  await exec('npm install swagger-parser')

  console.log('installing Path to Regexp (this may take a while)')
  await exec('npm install path-to-regexp')

  console.log('installing Another JSON Validator (this may take a while)')
  await exec('npm install ajv')

  console.log('installing AJV Formats (this may take a while)')
  await exec('npm install ajv-formats')

  console.log('installing Swagger UI Express (this may take a while)')
  await exec('npm install swagger-ui-express')
  /* #### END #### */

  /*
   * install Mocha
   */
  console.log('installing Mocha (this may take a while)')
  await exec('npm install --save-dev mocha')

  console.log('installing node-mocks-http (this may take a while)')
  await exec('npm install --save-dev node-mocks-http')

  console.log('installing SuperTest (this may take a while)')
  await exec('npm install --save-dev supertest')

  console.log('copying test directory')
  await cp(join(__dirname, '..', 'test'), join(projectWorkingDirectory, 'test'), {
    recursive: true
  })

  console.log('adding test to scripts in package.json')
  await exec('npm pkg set scripts.test="NODE_ENV=test mocha -r module-alias/register"')
  /* #### END #### */

  /*
   * Docker
   */
  const usingDocker = !!(
    await askQuestion('Are you using Docker (Y/n)? ', 'y', (a) => a.trim().match(/^(y|n|yes|no)$/i) ? true : 'Please enter y or n')
  ).trim().match(/^(y|yes)$/i)
  if (usingDocker) {
    const dockerUser = await askQuestion('What is your Docker Hub username? ')

    console.log('copying dockerignore')
    await cp(join(__dirname, '..', '.dockerignore'), join(projectWorkingDirectory, '.dockerignore'))

    console.log('copying Dockerfile')
    await cp(join(__dirname, '..', 'Dockerfile'), join(projectWorkingDirectory, 'Dockerfile'))

    console.log('adding start:docker to scripts in package.json')
    await exec('npm pkg set scripts.start:docker="node ."')

    console.log('adding build:docker to scripts in package.json')
    await exec(`npm pkg set scripts.build:docker="docker build --platform=linux/amd64 -t ${dockerUser}/${folderName}:$npm_package_version ."`)

    console.log('adding prebuild:docker to scripts in package.json')
    await exec('npm pkg set scripts.prebuild:docker="npm run lint"')

    console.log('adding serve:docker to scripts in package.json')
    await exec(`npm pkg set scripts.serve:docker="docker run --init --name ${folderName} -p 80:8080 --env-file ./.env -d ${dockerUser}/${folderName}:$npm_package_version"`)

    /*
     * Kubernetes
     */
    console.log('copying k8s directory')
    await cp(join(__dirname, '..', 'k8s'), join(projectWorkingDirectory, 'k8s'), {
      recursive: true
    })

    console.log('updating k8s manifests')
    fs.readdirSync(join(projectWorkingDirectory, 'k8s'))
      .filter((file) => file.endsWith('.yaml'))
      .forEach((file) => {
        fs.writeFileSync(
          join(projectWorkingDirectory, 'k8s', file),
          fs.readFileSync(join(projectWorkingDirectory, 'k8s', file), 'utf-8')
            .replace(/jabez07/g, dockerUser)
            .replace(/create-express-template/g, folderName)
        )
      })
    /* #### END #### */
  }
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

    console.log('copying github directory')
    await cp(join(__dirname, 'github'), join(projectWorkingDirectory, '.github'), {
      recursive: true
    })

    console.log('git init')
    await exec('git init')

    console.log('initial commit')
    await exec('git add --all')
    await exec('git commit -m "initial commit"')

    console.log('adding git remote origin')
    await exec(`git remote add origin ${gitUrl}`)

    console.log('adding version to scripts in package.json')
    // eslint-disable-next-line no-useless-escape
    await exec('npm pkg set scripts.version:short="echo \'{ \\"short\\": \\"\'\$(git rev-parse --short HEAD)\'\\" }\' > src/version.log"')

    console.log('adding prelint to scripts in package.json')
    await exec('npm pkg set scripts.prelint="npm run version:short"')
  }
  /* #### END #### */
}

main()
  .catch((err) => console.log('Error', err))
  .then(() => {
    console.log('Done')
    process.exit(0)
  })

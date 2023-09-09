import gulp, { dest, series, src } from 'gulp'
import shell from 'gulp-shell'
import ts from 'gulp-typescript'
import * as dotenv from 'dotenv'

const CMD_MOCHA_TEST =
  'mocha -r ts-node/register -r tsconfig-paths/register test/**/*.test.ts'
const CMD_MOCHA_TEST_INSPECT =
  'mocha -r ts-node/register -r tsconfig-paths/register --inspect-brk test/**/*.test.ts'

const compileTs = ts.createProject('tsconfig.json')

const setNodeEnv = (env: 'test' | 'dev' | 'prod') => (cb: () => void) => {
  process.env.NODE_ENV = env
  cb()
}

const loadDotenvs =
  (...filePaths: string[]) =>
  (cb: () => void) => {
    filePaths.forEach((filePath) =>
      dotenv.config({
        path: filePath,
      }),
    )
    cb()
  }
const loadTestDotenvFile = loadDotenvs('.env.test')

const runTests = shell.task(CMD_MOCHA_TEST)
const runTestsAndInspect = shell.task(CMD_MOCHA_TEST_INSPECT)
const runPrismaMigrations = shell.task('npx prisma migrate deploy')
const startServer = shell.task(
  'node --watch ./dist/main.js --watch-path=./dist',
)

function build() {
  return src('src/**/*.ts').pipe(compileTs()).pipe(dest('dist'))
}

function watch(cb: () => void) {
  gulp.watch('src/**/*.ts', build)
  cb()
}

exports.build = build
exports.test = series(setNodeEnv('test'), loadTestDotenvFile, runTests)
exports.testInspect = series(
  setNodeEnv('test'),
  loadTestDotenvFile,
  runTestsAndInspect,
)
exports.serve = series(build, watch, runPrismaMigrations, startServer)

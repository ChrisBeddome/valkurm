import fs from 'fs'
import {deleteMigrationsDirectory} from './tests/helpers.js'

beforeAll(() => {
  deleteMigrationsDirectory()
})

afterAll(() => {
  deleteMigrationsDirectory()
})

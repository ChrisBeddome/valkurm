# Valkurm
MySQL/MariaDB migration tool for node

### Installation

Install the package via `npm`:

```sh
npm install valkurm
```

Note that valkurm does not currently support global installation, this is due to the heuristics we use to determine the root directory of your application, which is necessary to write/read migration files.

Add a valkurmConfig.js to your project root:

```js
export default {
  host: "localhost",
  port: 3306,
  user: "dev_user",
  password: "password",
  database: "my_application"
}
```

optional config settings (defaults shown here relative to your application root directory):

```js
{
  schemaMigrationPath: '/migrations/schema',
  dataMigrationPath: '/migrations/data',
  schemaMigrationTable: 'schema_migrations',
  dataMigrationTable: 'data_migrations',
}
```

Setup a script in your package.json file, this alias is necessary to locate your configutration and to generate migration files in the correct location:

```json
{
  "name": "your app",
  "version": "1.0.0",
    ...
  "scripts": {
    "valkurm": "valkurm"
  },
  ...
}
```

### Usage

#### Generating migration files:
```sh
npm run valkurm generate-schema-migration <migration_name>
```
This will generate a timestamped file in the `schemaMigrationPath` directory, of the form:

```javascript
const up = () => {
    // return sql
}

const down = () => {
    // return sql
}
```

The `up` and `down` functions must return valid SQL which will be run during the migration step. Only the `up()` function is required, though if you wish to support rollbacks, you must provide a return value for the `down()` function as well.

Data migrations work the same way:

```sh
npm run valkurm generate-data-migration <migration_name>
```

#### Running migration files

To run a migration, or set of migrations, run:

```sh
npm run valkurm migrate-schema
```
or
```sh
npm run valkurm migrate-data
```

This will apply the migrations that have not yet been run, and update your `schema_migrations` or `data_migrations` table as necessary.

#### rollbacks

Not yet implemented


# Valkurm Test
Testing tool for [Valkurm](https://github.com/ChrisBeddome/valkurm)

### Instructions

Bring the containers up with `docker compose up`

Run the following commands against the test container:

```sh
npm install
npm install --prefix ../package/
npm link ../package
```

### Usage

Automated tests can be executed by running `npm run test` against the test container

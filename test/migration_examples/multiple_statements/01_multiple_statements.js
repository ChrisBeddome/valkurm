export const up = () => {
  return `
    CREATE TABLE test_first (name varchar(255));
    CREATE TABLE test_second (name varchar(255));
  `
}

export const down = () => {

}

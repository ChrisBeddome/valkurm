export const up = () => {
  // return SQL query for migration up
  return "select * from schema_migrations;"
}

export const down = () => {
  // return SQL query for migration down
}

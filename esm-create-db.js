//@ts-check
const { writeFileSync, copyFileSync } = require('fs');

module.exports = (cwd, config) => {
  const { database } = config;
  if (database === 'mysql2' || database === 'mysql') {
    copyFileSync(`${__dirname}/esm-db-mysql.js`, `${cwd}/db.js`);
    writeFileSync(`${cwd}/.env`, `
MYSQL_SERVER=localhost
MYSQL_DATABASE=realworld
MYSQL_USER=root
MYSQL_PASSWORD=
  `);
  } else if (database === 'mssql') {
    copyFileSync(`${__dirname}/esm-db-mssql.js`, `${cwd}/db.js`);
    writeFileSync(`${cwd}/.env`, `
SQL_CONNECTION_STRING=Server=localhost;Database=mydb;Trusted_Connection=True;
  `);
  } else {
    console.log(`Database ${database} not supported`);
  }
  return database;
}
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const app = express();
const port = 3000;

var db;
const tasks = [
    {id:1,name:"Task 1",done:true},
    {id:2,name:"Task 2",done:true},
    {id:3,name:"Task 3",done:false},
]
app.use('/docs',swaggerui.serve, swaggerui.setup(swaggerspecs))



async function initDb() {
  const db = await open({
    filename: 'tasks.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER
    )
  `);

  const rows = await db.get('Select count(*) as count from tasks')
  if(rows.count === 0){
    const stmnt = await db.prepare(`Insert into tasks (title, done) values (?, ?)`)
    await  stmnt.run('Task 1' , 1)
    await stmnt.run('Task 2', 1)
    await stmnt.run('Task 3', 0)
    await stmnt.finalize()
  }
  console.log((await db.all('Select * from tasks')).length)
const tasks = await db.all('SELECT * FROM tasks');

console.log(tasks);
  return db;
}



async function start() {
    db = await initDb()
    app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
}
start()
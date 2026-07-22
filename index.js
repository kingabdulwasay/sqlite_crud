const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const app = express();
app.use(express.json())
const port = 3000;

var db;

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

  return db;
}

app.get('/tasks', async (req, res) => {
    const tasks = await db.all(`Select * from tasks`);
    res.status(200).send(tasks);
});

app.get('/task/:id', async (req, res) => {
    const task = await db.get('Select * from tasks where id = ?', [Number(req.params.id)])
    if(task){
        res.status(200).send(task)
    }else{
        res.status(404).json({ "error": `Task ${req.params.id} not found` })
    }
})

app.post('/tasks', async (req, res) => {
    const {title, done} = req.body
    if(title === ""){
        res.status(400).send({})

    }else{
        const stmnt = await db.run('Insert into tasks (title, done) values (?, ?)', [title, Number(done)])
        res.status(201).send('Task Added')
    }
})

app.put('/task/:id', async (req, res) => {
    const {title, done} = req.body
    const task = await db.get('Select * from tasks where id = ?', [Number(req.params.id)])
    if(title === ""){
        res.status(400).send({})

    }else if(!task){
        res.status(404).json({ "error": `Task ${req.params.id} not found`})

    }else{
         await db.run('Update tasks set title = ?, done = ? where id = ?',
             [title, done, Number(req.params.id)])
        res.status(201).send("Task updated")
    }
})

app.delete('/task/:id', async (req, res) => {
    const task = await db.get('Select * from tasks where id = ?', [Number(req.params.id)])
    if(!task){
        res.status(404).json({ "error": `Task ${id} not found` })

    }else{
        await db.run('Delete from tasks where id =?', [Number(req.params.id)])
        res.status(204).send()
    }
})



async function start() {
    db = await initDb()
    app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
}
start()
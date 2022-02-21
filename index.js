import express, { response } from 'express';
import pg from 'pg';
import methodOverride from 'method-override';

// Override POST requests with query param ?_method=PUT to be PUT requests


// Initialise DB connection
const { Pool } = pg;
const pgConnectionConfigs = {
  user: 'cheenaeng',
  host: 'localhost',
  database: 'birding',
  port: 5432, // Postgres server always runs on this port by default
};
const pool = new Pool(pgConnectionConfigs);

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.listen(3004);
app.use(methodOverride('_method'));


app.get('/', (request, response) => {
  console.log('request came in');

  const whenDoneWithQuery = (error, result) => {
    if (error) {
      console.log('Error executing query', error.stack);
      
      return;
    }
    response.send(result);
  };

  // Query using pg.Pool instead of pg.Client
  pool.query('SELECT * from notes', whenDoneWithQuery);
});

app.get('/note', (request, response) => {
  console.log('request came in');
  response.render('form');
});

app.post('/note',(request,response)=>{

  const {habitat,date,appearance,behaviour,flocksize} = request.body 
  const inputData = [habitat,date,behaviour,appearance,flocksize]
  console.log(inputData)

  const sqlQuery = 'INSERT INTO notes (habitat, date, behaviour, appearance,flock_size) VALUES($1,$2,$3,$4,$5)'
  const whenDoneWithQuery= (error,result) =>{
    if(error){
       console.log('Error executing query', error.stack);
      response.status(503).send(result.rows);
    }

    pool.query('SELECT * FROM notes', (err,data)=>{
      if (err){
        console.log("error", err)
      }
      console.log(data.rows)

      const id = data.rows.length
       response.redirect(`/note/${id}`)
    })
   
  }
  pool.query(sqlQuery,inputData, whenDoneWithQuery)
})


app.get('/note/:id',(request,response)=>{
  const {id} = request.params

  const sqlQuery = `SELECT * FROM notes WHERE id= ${id}`

   const whenDoneWithQuery = (error,result) =>{
    if(error){
       console.log('Error executing query', error.stack);
      response.status(503).send(result.rows);
    }

    const data = {
      report: result.rows
    }
    console.log(data)
    response.render("bird-report",data)
  }

  pool.query(sqlQuery,whenDoneWithQuery)

})

app.get("/note/:id/edit", (req,res)=>{
  const {id} = req.params
  const sqlQuery = `SELECT * FROM notes WHERE id= ${id}`
   const whenDoneWithQuery = (error,result) =>{
    if(error){
       console.log('Error executing query', error.stack);
      response.status(503).send(result.rows);
    }

    const data = {
      requestedId:id,
      report: result.rows
    }
    console.log(data)
    res.render("edit-form",data)
  }
  pool.query(sqlQuery,whenDoneWithQuery)

})

app.put("/note/:id/edit",(req,res)=>{
  const {id} = req.params
  const updatedInformation = req.body
  const {habitat,date,appearance,behaviour,flocksize} = updatedInformation
  const inputData = [habitat,date,behaviour,appearance,flocksize]
  
  console.log(inputData)

  const sqlQuery = `UPDATE notes SET habitat =$1, date=$2, behaviour=$3, appearance=$4,flock_size=$5 WHERE id = ${id} `
  //set query to replace the row with new information 
  const whenDoneWithQuery = (error,result) =>{
    if(error){
       console.log('Error executing query', error.stack);
    }
    res.send("updated results")
  }
  pool.query(sqlQuery,inputData, whenDoneWithQuery)

})













import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "admin",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {

  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try{
    db.query("INSERT INTO users (email, password) VALUES ($1,$2)", [email,password]);
  } catch(err){
    console.error(err);
  };
  res.redirect("/");
});

async function passwordMatch(email, password){
  let response = false;
  try{
    const remail = await db.query("SELECT email FROM users WHERE email = $1",[email]);
    if(remail.rows[0].email == email){
      try{
        const rpassword = await db.query("SELECT password FROM users WHERE password = $1",[password]);
        if(rpassword.rows[0].password == password ){
          response = true;
        }        
      }catch(err){
        console.error(err);
        response = false;
      }
    }
  }catch(err){
    console.error(err);
    response = false;
  }
  return response;

}

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const matched = await passwordMatch(email, password); 
  if(matched){
    res.render("secrets.ejs");
  }else{
    res.redirect("/login");
  };

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

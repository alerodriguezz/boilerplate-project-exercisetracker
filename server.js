const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { Schema } = mongoose;
require('dotenv').config()

//connect to db 
mongoose.connect(
 process.env['MONGO_URL']
|| 'mongodb://localhost/exercise-track')

//database structure 
const userSchema = new Schema({ username:{type: String, unique: true} });
const User = mongoose.model('user', userSchema);

const exerciseSchema = new Schema({
  username: String ,
  description: String,
  duration: Number ,
  date: Date,
  userId: String
})
const Exercise = mongoose.model('Exercise',exerciseSchema);

//middleware
app.use(cors())

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(express.static('public'))

//landing page 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//return all users
app.get('/api/users', (req, res) => {
  User.find({}, (err,data )=> {
    if (!data){
      res.send("No users")
    }
    else{
       res.json(data)
    }
  });
});


//post new user 
app.post('/api/users',(req,res)=> {
  console.log("adding user...", req.body.username);
const newUser = new User({username: req.body.username});
newUser.save((err,data) => {
  if(err){
    res.json("Username already taken")
  }
  else{
  res.json({username: data.username, "_id":data.id})
  }
})

});

//retrieve logs 
app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  console.log("getting logs for...", id );
  var {from,to,limit} = req.query;
  //limit handling
    if (!limit || Number.isInteger(limit) || limit < 0) {
    limit = null;
  }
  //from and to handling
  function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if(!dateString.match(regEx)) return false;  // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0,10) === dateString;
  }

  if ( !from || !isValidDate(from)) from = null;
  if (!to ||  !isValidDate(to)) to = null;

  User.findById(id,(err,data) => {
if(!data){
  console.log(err);
  res.send("Unknown id");
}
else{
         
     const userName= data.username;
     console.log("from: ", from, "to: ", to, "limit: ", limit);
          Exercise.find({"userId":id},{date: {$gte: new Date(from), $lte: new Date(to) }}).select(["username","description","duration","date","userId"]).limit(+limit).exec((err,data)=>{
                          //change date format using toDateString method as suggested in fcc's prompt 
                          if(!data){
                            res.json({
                              "_id": id, 
                              "username": userName,
                              "count":0,
                              "log": []})}
                            else{
                                  let myData=[];
                              try{
                                
                               myData = data.map(exer => {
                            
                                        let dateFormatted = new Date(exer.date).toDateString();
                                       // console.log("id: ",exer.id,"description: ","description: ", exer.description, "duration: ", exer.duration, "date: ", dateFormatted);
                                        return { description: exer.description, duration: exer.duration, date: dateFormatted};
                                      })
                              res.json({
                                "username": userName,
                                "count": data.length,
                                 "_id": id,
                                "log": myData
                              })
                            }
                              catch(e) {
                              console.log(e.message);
                            }
                            } 
              })
    }
  })
})
  


//add exercises 
app.post('/api/users/:_id/exercises', (req,res) => {
  const id = req.params._id
  var {description,duration,date} = req.body;
  console.log("adding exercise...", id)
  User.findById(id,(err,data)=> {
    if(!data){
      res.send("Cast to ObjectId failed for value "+ id+" at path _id for model User")
    }
    else {
      const username = data.username;

        if (!date || date == "Invalid Date") {
                 
                date = new Date();
            }
            
  const newExercise = new Exercise ({username,description,duration,date,userId: id});
  newExercise.save((err,data)=>{
       if(err){
         console.log(err);
         res.send("Error adding exercise.");
       }
       else{
        res.json({username, description, duration: +duration, date: new Date(date).toDateString() , "_id":id})
        }
     })
    }
      })


})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});


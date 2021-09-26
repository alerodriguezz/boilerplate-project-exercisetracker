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
  userId: String ,
  description: String,
  duration: Number ,
  date: Date
})
const Exercise = mongoose.model('Exercise',exerciseSchema)

//middleware
app.use(cors())

app.use(bodyParser.urlencoded({entended:false}))
app.use(bodyParser.json())

app.use(express.static('public'))

//landing page 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.post('/api/users',(req,res)=> {
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

app.post('/api/users/:_id/exercises', (req,res) => {
  const id = req.params._id
  const {description,duration,date} = req.body;
  console.log(id)
  User.findById(id,(err,data)=> {
    if(!data){
      res.send("Cast to ObjectId failed for value "+ id+" at path _id for model User")
    }
    else {
      const username = data.username;

        if (date == '') {
                let today = new Date()
                date = today.toDateString()
            }
  const newExercise = new Exercise ({id, description,duration,date})
  newExercise.save((err,data)=>{
        res.json({username, description, duration:Number(duration), date: new Date(date).toDateString(), _id:id})
     })
    }
      })


})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});


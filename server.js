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

const userSchema = new Schema({ username:String });
const User = mongoose.model('user', userSchema);

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
  res.json({username: data.username, "_id":data.id})
})

});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

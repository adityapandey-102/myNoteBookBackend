const connectToMongo = require("./db");
connectToMongo();
const express = require("express");
const app = express();
const port =process.env.PORT || 5000;


//enabling the cors
var cors = require('cors');
app.use(cors());

//middleware for sending response in json in body request.
app.use(express.json())

//available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))


app.listen(port, () => {
  console.log(`MyNoteBook app is listening on port: ${port}`);
});

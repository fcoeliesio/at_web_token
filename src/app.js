require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userRouter =  require('./routers/userRouter');
const userService =  require('./services/userService');

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const PASSWORD = process.env.PASSWORD;
const AAP_NAME = process.env.AAP_NAME;
const USER_NAME = process.env.USER_NAME;
const CLUSTER_NAME = process.env.CLUSTER_NAME;

const SECRET_KEY = 'your_secret_key';

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await userService.getByUserName(username);
  
  if (!user) {
      return res.status(401).send('Invalid username or password');
  }

  const validPassword = user.password == password;
  if (!validPassword) {
      return res.status(401).send('Invalid username or password');
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: 30000 });
  res.json({ token });
});

app.use((req, res, next)=>{
  const token = req.body.token;

  if(!token){
    return res.status(401).send('Token not found');
  }
  
  jwt.verify(token, SECRET_KEY, function(err, decoded) {
  if(err){
    return res.status(401).send('Invalid Token');
  }
  next();
  });
});

mongoose.connect(`mongodb+srv://${USER_NAME}:${PASSWORD}@${CLUSTER_NAME}.0umakns.mongodb.net`,{
  retryWrites: true, 
  w: 'majority', 
  appName: AAP_NAME
}).then(() => {
  console.log('Conectado ao MongoDB');
}).catch(err => {
  console.error('Erro de conexão com o MongoDB', err);
});;

app.use('/api', userRouter);

app.listen(PORT, ()=>{
  console.log(`Servidor iniciado na porta ${PORT}`);
});


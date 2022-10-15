const express = require('express');
const { db } = require('./models/index.js');
const app = express();
const port = 3000;
const postsRouter = require('./routes/posts.js');
const commentsRouter = require('./routes/comments.js');
const usersRouter = require('./routes/users.js');
// const { db } = require("./models/index");
db;
app.use(express.json());

app.use('/api', [postsRouter, commentsRouter, usersRouter]);

app.get('/', (req, res) => {
  res.send('테스트 테스트');
});
app.listen(port, () => {
  console.log(port, ' 포트로 서버가 켜졌어요!!');
});

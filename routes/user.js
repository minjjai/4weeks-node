const express = require("express");
const { Users } = require("../models");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");
const Joi = require("joi");

const app = express();
const router = express.Router();

//API들의 입력값을 validation라이브러리 joi를 이용해 검증
 const postUsersSchema = Joi.object({
    nickname: Joi.string().min(3).pattern(new RegExp(/^[a-z|A-Z|0-9]+$/)).required(),
    password: Joi.string().min(4).disallow(Joi.ref('nickname')).required(),
    confirmPassword: Joi.ref('password'),
  });
  

// 회원가입 API
router.post("/signup", async (req, res) => {
    try {
      const { nickname, password, confirmPassword } = await postUsersSchema.validateAsync(req.body);
  
      if (password !== confirmPassword) {
        res.status(400).send({
          errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
        });
        return;
      }
      console.log(Users);
  
      const existUsers = await Users.findOne({ where: { nickname } });
      if (existUsers !== null) {
        res.status(400).send({
          errorMessage: "이미 가입된 닉네임이 있습니다.",
        });
        return;
      }
  
      await Users.create({ nickname, password });
  
      res.status(201).send({ "message": "회원가입이 완료되었습니다"});
    } catch (err) { // User에서 찾은 값 postUsersSchema.validationAsync(req.body) 검증 실패
      console.log(err);
      res.status(400).send({
        errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
      });
    }
  });  

  //API들의 입력값을 validation라이브러리 joi를 이용해 검증
const postAuthSchema = Joi.object({
  nickname: Joi.string().min(3).pattern(new RegExp(/^[a-z|A-Z|0-9]+$/)).required(),
    password: Joi.string().min(4).disallow(Joi.ref('nickname')).required(),
});
router.post("/login", async (req, res) => {
  try {
    const { nickname, password } = await postAuthSchema.validateAsync(req.body);

    const user = await Users.findOne({
      where: { nickname, password }, });

    if (!user || password !== user.password) {
      res.status(400).send({
        errorMessage: "닉네임 또는 패스워드가 잘못됐습니다.",
      });
      return;
    }

    const token = jwt.sign({ userId: user.userId }, "my-secret-key");
    res.send({
      token,
    });
  } catch (err) { // User에서 찾은 값 postUsersSchema.validationAsync(req.body) 검증 실패
      console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

router.get("/users/me", authMiddleware, async (req, res) => { //
  const{ user } = res.locals; //구조분해할당 
  res.status(200).send({
      user: {
          email: user.email,
          nickname: user.nickname,
      }
  });
})

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

module.exports = router;

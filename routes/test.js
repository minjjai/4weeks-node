router.get('/user', async (req, res) => {
  try {
    const userAll = await Users.find();
    const users = userAll.map((u) => {
      return {
        userId: u.userid,
        name: u.name,
        ID: u.ID,
        pw: u.pw,
      };
    });
    res.json({ result: users });
  } catch {
    return res.status(400).json({ message: '회원 목록 조회 실패' });
  }
});

router.get('/user/:userid', async (req, res) => {
  const { userid } = req.params;

  const users = await Users.find({ userid });
  const user = users.map((u) => {
    return {
      userId: u.userid,
      name: u.name,
      ID: u.ID,
      pw: u.pw,
    };
  });
  if (user.length == 0) {
    return res.status(400).json({ message: '회원 상세 조회 실패' });
  }
  res.json({ result: user });
});

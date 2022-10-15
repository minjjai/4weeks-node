const express = require('express');
const router = express.Router();
const { Posts } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const { Likes } = require('../models');

router.post('/posts', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const nickname = res.locals.user.nickname;

  await Posts.create({
    user: nickname,
    title: title,
    content: content,
    likeSum: 0,
  });
  res.json({ result: 'success' });
});

// 게시글 조회 GET ( ex) localhost:3000/api/posts )
router.get('/posts', async (req, res) => {
  const postAll = await Posts.findAll();
  postAll.sort((a, b) => b.likeSum - a.likeSum);
  const posts = postAll.map((post) => {
    return {
      user: post.user,
      title: post.title,
      content: post.content,
      postId: post.postId,
      likeSum: post.likeSum,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  });
  res.json({ posts: posts });
  res.status(404).json({ message: '회원 목록 조회 실패' });
});

router.get('/posts/like', authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const likes = await Likes.findAll({ where: { user: user.nickname } });
  const array = likes.map((a) => a.like);
  const likedPosts = [];
  for (let i = 0; i < likes.length; i++) {
    const likes = await Posts.findByPk(array[i]);
    if (likes) {
      likedPosts.push(likes);
    } else {
      likedPosts.push('삭제된 게시글 입니다');
    }
  }
  res.json(likedPosts);
});

// 게시글 상세 조회 GET ( ex) localhost:3000/api/posts/postid값 )
router.get('/posts/:_postId', async (req, res) => {
  const { _postId } = req.params;

  const posts = await Posts.findByPk(_postId);

  res.json({ posts });
});

// 게시글 수정 PUT ( ex) localhost:3000/api/posts/postid값 )
router.put('/posts/:_postId', authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const { title, content } = req.body;
  const { user } = res.locals;

  const posts = await Posts.findByPk(_postId);
  if (posts.user === user.nickname) {
    await Posts.update(
      { title, content },
      {
        where: { postId: _postId },
      },
    );
  } else {
    res.json({ err: '권한이 없습니다.' });
  }

  res.json({ message: '게시글을 수정하였습니다.' });
});

// 게시글 삭제 DELETE ( ex) localhost:3000/api/posts/postid값 )
router.delete('/posts/:_postId', authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const { user } = res.locals;

  const posts = await Posts.findByPk(_postId);
  console.log(posts);
  if (posts.user === user.nickname) {
    await Posts.destroy({ where: { postId: _postId } });
  } else {
    res.json({ err: '권한이 없습니다.' });
  }
  res.json({ result: 'success' });
});

//게시글 좋아요
router.put('/posts/:_postId/like', authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const { like } = req.body;
  const { user } = res.locals;

  if (like) {
    await Likes.create({ user: user.nickname, like: _postId });
    await Posts.increment({ likeSum: 1 }, { where: { postId: _postId } });
    res.json({ message: '게시글의 좋아요를 등록하였습니다.' });
  } else {
    await Likes.destroy({ where: { user: user.nickname, like: _postId } });
    await Posts.decrement({ likeSum: 1 }, { where: { postId: _postId } });
    res.json({ message: '게시글의 좋아요를 취소하였습니다.' });
  }
});

module.exports = router;

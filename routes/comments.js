// express 연결을 위한 코드
const express = require("express");

// 스키마에서 뼈대를 불러올 코드
const { Comments } = require("../models");

// 라우터 연결을 위한 코드
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

// 댓글 생성 POST ( ex) localhost:3000/api/comments/받아오려는 id값 )
router.post("/comments/:_postsId", authMiddleware, async (req, res) => {
    const { content } = req.body;
    const { _postsId } = req.params;
    const nickname = res.locals.user.nickname;
    
    if( content === "")
    { 
        res.json({"message": "댓글내용을 입력해주세요."})
    } else{
        await Comments.create({
        postsId: _postsId,
        user: nickname,
        content: content
        })
       
        res.json({"message": "댓글이 생성되었습니다."}) 
        }
});

// 댓글을 목록 보기 GET ( ex) localhost:3000/api/comments/받아오려는 id값 )
router.get("/comments/:_postsId", async (req, res) => {
    const commentAll = await Comments.findAll()

    const comments = commentAll.map((com) => {
        return{
            user: com.user,
            content: com.content,
            commentId: com.commentId,
            createdAt: post.createdAt, 
            updatedAt: post.updatedAt
        };
    });
    res.json({ comments : comments });
});

// 댓글 수정 : /comments/:_commentId PUT
router.put("/comments/:_commentId", authMiddleware, async (req, res) => {
    const {_commentId} = req.params
    const { content } = req.body
    const nickname = res.locals.user.nickname;

    const comments = await Comments.findByPk(_commentId);
    if( comments.user === nickname ){
        await Comments.update( { content }, {where: {commentId: _commentId}});
    }
    else{
        res.json({err: "권한이 없습니다."});
    }

    res.json({ success: "댓글을 수정하였습니다." });
});



// 댓글 삭제 : /comments/:_commentId DELETE
router.delete("/comments/:_commentId", authMiddleware, async (req, res) => {
    const {_commentId} = req.params;
    const {user} = res.locals;

    const comments = await Comments.findByPk(_commentId);
    if( comments.user === user.nickname){
        await Comments.destroy({ where: {commentId: _commentId}});
    }
    else{
        res.json({err: "권한이 없습니다."});
    }

    res.json({result: "success" });
});

module.exports = router;
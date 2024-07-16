const express = require('express');
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/UserController");
const PostController = require("../controllers/PostController");
const CommentsController = require("../controllers/commentController");
const authToken = require("../middlewares/auth");
const LikeController = require("../controllers/likeController");
const FollowController = require("../controllers/followController");

const uploadDestination = 'uploads';

const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });

//User router
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current', authToken, UserController.current);
router.get('/users/:id', authToken, UserController.getUserById);
router.put('/users/:id', authToken, UserController.updateUser);

//Post router
router.post('/posts', authToken, PostController.createPost)
router.get('/posts', authToken, PostController.getAllPost)
router.get('/posts/:id', authToken, PostController.getPostById)
router.delete('/posts/:id', authToken, PostController.deletePost)

//Comment router
router.post('/comments', authToken, CommentsController.createComment)
router.delete('/comments/:id', authToken, CommentsController.deleteComment)

//Like Router
router.post('/likes', authToken, LikeController.likePost);
router.delete('/likes/:id', authToken, LikeController.unlikePost);

//Follow Controller

router.post('/follow', authToken, FollowController.followUser);
router.delete('/follow/:id', authToken, FollowController.unfollowUser)

module.exports = router;
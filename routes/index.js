const express = require('express');
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/UserController");
const authToken = require("../middlewares/auth");

const uploadDestination = 'uploads';

const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current', authToken, UserController.current);
router.get('/users/:id', authToken, UserController.getUserById);
router.put('/users/:id', authToken, UserController.updateUser);


module.exports = router;
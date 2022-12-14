const express = require("express");
const auth = require("../middleware/auth");

const routerPosts = express.Router();
const multer = require('../middleware/multer-config');

const postCtrl = require("../controllers/postControl.js");
const userCtrl = require("../controllers/userControl.js")

routerPosts.get('/', auth, postCtrl.getPostList);
routerPosts.post('/', auth, multer, postCtrl.postPost);
routerPosts.put('/:id', auth, multer, postCtrl.updatePost);
routerPosts.delete('/:id', auth, postCtrl.deletePost);
routerPosts.post('/:id/like', auth, postCtrl.ratePost);
routerPosts.get('/users', userCtrl.getUser);
 
module.exports = routerPosts;
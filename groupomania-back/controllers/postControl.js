const Post = require('../models/post');
const fs = require('fs');
const { default: mongoose } = require('mongoose');
const { ObjectId } = require('mongodb');

exports.getPost = (req, res, next) => {
    Post.findOne({ _id: ObjectId(req.params.id) })
    .then(post => res.status(200).json(post))
    .catch(error => res.status(404).json({ error }));
};

exports.getPostList = (req, res, next) => {
    Post.find()
    .then(posts => res.status(200).json(posts))
    .catch(error => res.status(400).json({ error }));
};

exports.postPost = (req, res, next) => {
    const postObject = req.body;
    delete postObject._id;
    delete postObject._userId;
    const post = new Post({
        ...postObject,
        userId: req.headers.userid,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.body.file.filename}`,
        postId: new mongoose.Types.ObjectId(),
    });
    post.save()
    .then(() => { res.status(201).json({message: 'Post enregistrée !'})})
    .catch(error => { console.log(error);res.status(400).json( { error })})
 };

 exports.updatePost = (req, res, next) => {
    const postObject = req.body.file ? {
        ...JSON.parse(req.body.post),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.body.file.filename}`
    } : { ...req.body };
  
    delete postObject._userId;
    Post.findOne({_id:  ObjectId(req.params.id)})
        .then((post) => {
            if (post.userId != req.headers.userid) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Post.updateOne({ _id: req.params.id}, { ...postObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Post modifiée!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 exports.deletePost = (req, res, next) => {
    Post.findOne({ _id:  ObjectId(req.params.id)})
        .then(post => {
            if (post.userId != req.headers.userid) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = post.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Post.deleteOne({_id: ObjectId(req.params.id)})
                        .then(() => { res.status(200).json({message: 'Post supprimée !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

exports.ratePost = (req, res, next) => {
    Post.findOne({ _id:  ObjectId(req.params.id)})
        .then(post => {
            // Cleaning the current state of likes in order to have only one instance of userId per array
            console.log(post)
            post.usersDisliked = Array.from(Set(post.usersDisliked))
            post.usersLiked= Array.from(Set(post.usersLiked))
            switch(req.body.like) {
                
                case 1 :
                    post.usersLiked.push(req.body.userId);
                    break;
                case 0 :
                    // Cleaning the current state of likes
                    post.usersDisliked = post.usersDisliked.filter(e => e !== req.body.userId);
                    post.usersLiked= post.usersLiked.filter(e => e !== req.body.userId);
                    break;
                case -1 :
                    post.usersDisliked.push(req.body.userId);
                    break; 
                default:
                    res.status(401).json({message: 'Unauthorized like status, should be either +-1 or 0'});
            };
            post.likes = post.usersLiked.length
            post.dislikes = post.usersDisliked.length
            post.save()
            .then(() => { res.status(201).json({message: 'Like/Dislike mis à jour !'})})
            .catch(error => { res.status(400).json( { error })})
        .catch( error => {
            res.status(500).json({ error });
        });
    })
}
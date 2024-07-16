const { prisma} = require('../prisma/prisma-client');

const PostController = {
    createPost: async (req, res) => {
        const { content } = req.body;
        const authorId = req.user.userId;

        if(!content || !authorId){
            res.status(400).json({error: 'missing content or user'});
        }

        try{
            const post = await prisma.post.create({
                data:{
                    content,
                    authorId
                }
            })
            res.status(200).json(post);
        }catch(err){
            console.error('Error creating post', err);
            res.status(500).json({error: "Server Error"});
        }
    },
    getAllPost: async (req, res) => {
        const userId = req.user.userId;

        try{
            const posts = await prisma.post.findMany({
                include: {
                    likes: true,
                    author: true,
                    comments: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            const postWithLikeInfo = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(like => like.userId === post.userId)
            }))

            res.status(200).json(postWithLikeInfo);
        }catch(err){
            console.error('Error getting post', err);
            res.status(500).json({error: "Server Error"});
        }
    },
    getPostById: async (req, res) => {
        const {id} = req.params;
        const userId = req.user.userId;

        try{
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    comments: {
                        include: {
                            user: true
                        }
                    },
                    likes: true,
                    author: true
                }
            })

            if(!post){
                return res.status(404).json({error: "Posts not found"});
            }
            const postWithLikeInfo = {
                ...post,
                likedByUser: post.likes.some(like => like.userId === post.userId)
            }
            res.status(200).json(postWithLikeInfo);
        }catch(err){
            console.log(err, " Posts not found");
            res.status(500).json({error: "Server Error"});
        }
    },
    deletePost: async (req, res) => {
        const {id} = req.params;

        const post = await prisma.post.findUnique({where: {id}});

        if(!post){
            return res.status(404).json({error: 'Post not found'});
        }

        if(post.authorId !== req.user.userId){
            return res.status(403).json({error: "You don't have permission to delete post"});
        }

        try{
            const transaction = await prisma.$transaction([
                prisma.comment.deleteMany({where: { postId: id }}),
                prisma.like.deleteMany({where: { postId: id }}),
                prisma.post.delete({where: { id }})
            ])
            res.status(200).json(transaction);
        }catch (err){
            console.log('Delete post error', err);
            res.status(500).json({error: "Server Error"});
        }
    }
}

module.exports = PostController;
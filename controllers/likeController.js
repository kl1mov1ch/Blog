const {prisma} = require('../prisma/prisma-client');

const LikeController = {

     likePost:  async (req, res) => {
        const {postId} = req.body;
        const userId = req.user.userId;

        if (!postId) {
            return res.status(400).json({error: 'all fields are required'});
        }

        try{
            const existingLike = await prisma.like.findFirst({
                where: { postId, userId}
            })

            if (existingLike) {
                return res.status(400).json({error: "You added like on this post"});
            }

            const like = await prisma.like.create({
                data: {postId, userId}
            })

            res.status(200).json(like);
        }catch(err){
            res.status(500).json({error: "Server Error"});
        }
    },

    unlikePost:  async (req, res) => {
         const {id} = req.params;
         const userId = req.user.userId;

         if(!id){
             return res.status(400).json({error: 'You added dislike on this post'});
         }

         try{
             const existingLike = await prisma.like.findFirst({
                 where: { postId: id, userId}
             });

             if (!existingLike) {
                 return res.status(400).json({error: "dislike on this post is already exists"});
             }

             const like = await prisma.like.deleteMany({
                 where: { postId: id, userId}
             })

             res.status(200).json(like);
         }catch (err) {
            res.status(500).json({error: "Server Error"});
         }
    }
}

module.exports = LikeController;
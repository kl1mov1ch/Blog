const {prisma} = require('../prisma/prisma-client');

const CommentController = {
    createComment: async (req, res) => {
      const { postId, content } = req.body;

      const userId = req.user.userId;

      if (!postId || !content) {
          return res.status(400).json({error: 'Post not found'});
      }

      try{
          const comment = await prisma.comment.create({
              data: {
                  postId,
                  userId,
                  content
              }
          })
          res.json(comment);
      }catch(err){
          console.log('Comment not create', err);
          res.status(500).json({err: 'Server error'});
      }
    },
    deleteComment: async (req, res) => {
        const {id} = req.params;
        const userId = req.user.userId;

        try{

            const comment = await prisma.comment.findUnique({where: {id}});

            if(!comment){
                return res.status(400).json({error: 'Comment not found'});
            }

            if(comment.userId !== userId){
                return res.status(403).json({error: "You don't have permission to delete post"});
            }

            await prisma.comment.delete({where: {id}});

            res.json(comment);
        }catch (err) {
            console.error("Delete comment error", err);
            res.status(500).json({error: "Server error"});
        }
    }
}

module.exports = CommentController;
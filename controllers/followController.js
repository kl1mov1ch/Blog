const {prisma} = require('../prisma/prisma-client');

const FollowController = {
    followUser: async (req, res) => {
        const {followingId} = req.body;
        const userId = req.user.userId;

        if(followingId === userId){
            return res.status(200).json({message: 'you can\'t subscribe to yourself'});
        }

        try {
            const existingSubscription = await prisma.follows.findFirst({
                where: {
                    AND: [{
                        followerId: userId
                    },
                        {
                            followingId: followingId
                        }
                    ]
                }
            })

            if(existingSubscription) {
                return res.status(200).json({message: 'You already subscribe'});
            }

            await prisma.follows.create({
                data: {
                    follower: { connect: { id: userId } },
                    following: { connect: { id: followingId } }
                }
            });
            res.status(200).json({message: 'Subscribe created successfully.'});
        }catch(err){
            console.log('error', err);
            res.status(500).json({error: "Server Error"});
        }
    },

    unfollowUser: async (req, res) => {
        const {followingId} = req.body;
        const userId = req.user.userId;

        try{
            const follows = await prisma.follows.findFirst({
                where: {
                    AND: [{followerId: userId}, {followingId: followingId}]
                }
            })

            if(!follows) {
                return res.status(404).json({error: "Account not found"});
            }

            await prisma.follows.delete({
                where: {id: follows.id}
            })
            res.status(200).json({message: 'Subscribe deleted successfully.'});
        }catch (err) {
            res.status(500).json({error: "Server Error"});
        }
    }
}

module.exports = FollowController;
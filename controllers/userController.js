// D:\Blog\controllers\UserController.js
const bcrypt = require("bcryptjs");
const {prisma} = require("../prisma/prisma-client");
const jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const UserController = {
    register: async (req, res) => {
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({error: "Все поля обязательны"});
        }
        try{
           const existingUser = await prisma.user.findUnique({where: {email}});
           if(existingUser) {
               return res.status(400).json({existingUser});
           }
           const hashedPassword = await bcrypt.hash(password, 12);
           const png = jdenticon.toPng(name, 200);
           const avatarName = `${name}_${Date.now()}.png`;
           const avatarPath = path.join(__dirname, '../uploads', avatarName);
           fs.writeFileSync(avatarPath, png);
           const user = await prisma.user.create({
               data: {
                   email,
                   password: hashedPassword,
                   name,
                   avatarUrl: `../uploads/${avatarPath}`,
               }
           })
            res.json({user: user});
        }
        catch(err){
            console.log("Error creating user", err);
        }
    },

    login: async (req, res) => {
        const {email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({error: "Login Error"})
        }

        try{
           const user = await prisma.user.findUnique({where: {email}});
           if(!user){
               return res.status(400).json({error: "User not Login"});
           }
           const validPassword = await bcrypt.compare(password, user.password);
           if(!validPassword){
               return res.status(400).json({error: "User not Login"});
           }

           const token = jwt.sign(({userId: user.id}), process.env.JWT_SECRET);
           res.json({token: token});
        }
        catch(err){
            console.log("Error login user", err);
            res.status(500).json({error: "Server Error"});
        }

    },

    getUserById: async (req, res) => {
        const {id} = req.params;
        const userId = req.user.userId;

        try{
            const user = await prisma.user.findUnique(
                {
                    where: {id},
                    include: {
                        followers: true,
                        following: true
                    }
                });
            if(!user){
                return res.status(404).json({error: "User not Login"});
            }

            const isFollowing = await prisma.follows.findFirst({
                where: {
                    AND: [
                        {followerId: userId},
                        {followingId: id}
                    ]
                }
            })
            res.json({...user, isFollowing: Boolean(isFollowing)});
        }

        catch(err){
            res.status(500).json({error: "Server Error"});
        }
    },
    updateUser: async (req, res) => {
        const { id } = req.params;
        const { email, dateOfBirth, bio, location, name } = req.body;

        let filePath;
        if (req.file && req.file.path) {
            filePath = req.file.path;
        }

        try {
            if (email) {
                const existingUser = await prisma.user.findFirst({ where: { email: email } });

                if (existingUser && existingUser.id !== id) {
                    return res.status(403).json({ error: "Email already exists" });
                }
            }
            const user = await prisma.user.update({
                where: { id },
                data: {
                    email: email || undefined,
                    name: name || undefined,
                    avatarUrl: filePath ? `/${filePath}` : undefined,
                    dateOfBirth: dateOfBirth || undefined,
                    bio: bio || undefined,
                    location: location || undefined
                }
            });
            res.json({ user: user });
        } catch (error) {
            console.error('Update user error', error);
            res.status(500).json({ error: "Server Error" });
        }
    },
    current: async (req, res) => {
        res.send('current');
    }
};

module.exports = UserController;

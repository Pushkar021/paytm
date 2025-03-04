    const express = require('express');
    const { User } = require('../db'); 
    const z = require('zod');
    const router = express.Router();
    require('dotenv').config();
    const jwt = require("jsonwebtoken");

    const jwtpass = process.env.JWT_SEC;

    const argsparse = (args) => {
        const schema = z.object({
            username: z.string(),
            password: z.string()
        });
        return schema.safeParse(args);
    };


    const token = (args) => {
        return jwt.sign(args, jwtpass);
    };

    router.post("/", async (req, res) => {
        try {
        
            const parse = argsparse(req.body);
            if (!parse.success) {
                return res.json({
                    message: "Invalid Input!!"
                });
            }

            const { username, password } = req.body;

        
            const user = await User.findOne({ username, password });

            if (user) {
                const jwtcode = token({ userId: user._id });
                return res.json({
                    jwt: jwtcode
                });
            } else {
                return res.json({ message: "Invalid credentials" });
            }

        } catch (e) {
            res.json({
                message: "Something went wrong with the server!!"
            });
        }
    });

    module.exports = router;

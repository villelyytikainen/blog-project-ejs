const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "unauthorized" });
    }
};

router.get("/admin", async (req, res) => {
    try {
        const locals = {
            title: "admin",
            description: "simple blog created with nodejs, express & mongodb",
        };

        res.render("admin/index", { locals, layout: adminLayout });
    } catch (err) {
        console.error(err);
    }
});

router.post("/admin", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
    }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "dashboard",
            description: "simple blog created wiht nodejs, express & mongodb",
        };

        const data = await Post.find();
        res.render("admin/dashboard", { locals, data, layout: adminLayout });
    } catch (error) {
        console.error(error);
    }
});

router.get("/add-post", authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "add post",
            description: "simple blog created with nodejs, express & mongodb",
        };
        const data = await Post.find();
        res.render("admin/add-post", {
            locals,
            layout: adminLayout,
        });
    } catch (error) {
        console.error(error);
    }
});

router.post("/add-post", authMiddleware, async (req, res) => {
    try {
        const data = await Post.create(req.body);
        console.log(data);
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
    }
});

router.get("/edit-post/:id", authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "edit post",
            description: "simple blog created with nodejs, express & mongodb",
        };
        const data = await Post.findOne({ _id: req.params.id });
        res.render(`admin/edit-post`, {
            locals,
            data,
            layout: adminLayout,
        });
    } catch (error) {
        console.error(error);
    }
});

router.put("/edit-post/:id", authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now(),
        });

        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.error(error);
    }
});

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
    try {
        console.log(req.params.id);
        await Post.deleteOne({ _id: req.params.id });
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    //res.json({ message: "logout success" });
    res.redirect("/");
});

// router.post("/register", async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10);
//         try {
//             const user = await User.create({ username, password: hashedPassword });
//             res.status(201).json({ message: "user created", user });
//         } catch (error) {
//             if (error.code === 11000) {
//                 res.status(409).json({ message: "user already in use" });
//             }

//             res.status(500).json({ message: "internal server error" });
//         }
//     } catch (err) {
//         console.error(err);
//     }
// });

module.exports = router;

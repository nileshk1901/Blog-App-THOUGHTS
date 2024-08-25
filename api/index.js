const express = require("express");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/UserModel");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const Post = require("./models/Post");
const uploadMiddleware = multer({ dest: "uploads/" });

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET || "default_secret"; // Use a default secret for development

const app = express();
app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL || "http://localhost:3000",
	})
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose.connect(process.env.MONGO_URL);

// Register route
app.post("/register", async (req, res) => {
	const { username, password } = req.body;

	try {
		const userDoc = await User.create({
			username,
			password: bcrypt.hashSync(password, salt),
		});
		res.json(userDoc);
	} catch (error) {
		console.error("Registration error:", error);
		res.status(400).json(error);
	}
});

// Login route
app.post("/login", async (req, res) => {
	const { username, password } = req.body;

	try {
		const userDoc = await User.findOne({ username });
		if (!userDoc) {
			return res.status(400).json("Invalid credentials");
		}

		const passOk = bcrypt.compareSync(password, userDoc.password);
		if (passOk) {
			jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
				if (err) throw err;
				res.cookie("token", token).json({
					id: userDoc._id,
					username,
				});
			});
		} else {
			res.status(400).json("Invalid credentials");
		}
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json("Login error");
	}
});

// Profile route
app.get("/profile", (req, res) => {
	const { token } = req.cookies;
	jwt.verify(token, secret, {}, (err, info) => {
		if (err) return res.status(401).json("Unauthorized");
		res.json(info);
	});
});

// Logout route
app.post("/logout", (req, res) => {
	res.cookie("token", "").json("ok");
});

// Create post route
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
	const { originalname, path } = req.file;
	const ext = originalname.split(".").pop();
	const newPath = `${path}.${ext}`;
	fs.renameSync(path, newPath);

	const { token } = req.cookies;
	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) return res.status(401).json("Unauthorized");

		try {
			const { title, summary, content } = req.body;
			const postDoc = await Post.create({
				title,
				summary,
				content,
				cover: newPath,
				author: info.id,
			});
			res.json(postDoc);
		} catch (error) {
			console.error("Post creation error:", error);
			res.status(500).json("Post creation error");
		}
	});
});

// Update post route
app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
	let newPath = null;
	if (req.file) {
		const { originalname, path } = req.file;
		const ext = originalname.split(".").pop();
		newPath = `${path}.${ext}`;
		fs.renameSync(path, newPath);
	}

	const { token } = req.cookies;
	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) return res.status(401).json("Unauthorized");

		try {
			const { id, title, summary, content } = req.body;
			const postDoc = await Post.findById(id);
			if (!postDoc) return res.status(404).json("Post not found");

			const isAuthor = postDoc.author.equals(info.id);
			if (!isAuthor) return res.status(400).json("You are not the author");

			postDoc.title = title;
			postDoc.summary = summary;
			postDoc.content = content;
			postDoc.cover = newPath ? newPath : postDoc.cover;

			await postDoc.save();
			res.json(postDoc);
		} catch (error) {
			console.error("Post update error:", error);
			res.status(500).json("Post update error");
		}
	});
});

// Fetch posts route
app.get("/post", async (req, res) => {
	try {
		const posts = await Post.find()
			.populate("author", ["username"])
			.sort({ createdAt: -1 })
			.limit(20);
		res.json(posts);
	} catch (error) {
		console.error("Fetching posts error:", error);
		res.status(500).json("Fetching posts error");
	}
});

// Fetch single post route
app.get("/post/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const postDoc = await Post.findById(id).populate("author", ["username"]);
		if (!postDoc) return res.status(404).json("Post not found");
		res.json(postDoc);
	} catch (error) {
		console.error("Fetching post error:", error);
		res.status(500).json("Fetching post error");
	}
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

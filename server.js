require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const Product = require("./models/Product");
const Order = require("./models/Order");
const User = require("./models/User");

const app = express();
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch(err => console.log("MongoDB Connection Error:", err.message));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
res.json({ message: "NOVA Store API is running!" });
});
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: "user"
        });

        await user.save();

        res.json({ message: "Registration successful!" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password!" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "nova_secret_key",
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful!",
            token: token,
            name: user.name
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/products", async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json({ message: "Product added successfully!", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/api/orders", async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        res.json({
            message: "Order placed successfully!",
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`NOVA Store running on port ${PORT}`);
});

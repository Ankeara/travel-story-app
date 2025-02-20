require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");

const { authenticateToken } = require("./utilities");

// Connecting to database
mongoose.connect(config.connectionString);

// Call user model 
const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");
const { error } = require("console");

// Create express app
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Test API
app.get("/hello", async (req, res) => {
    return res.status(200).json({
        message: "Hello World",
    });
});

// Create account
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    // If null of fields
    if (!fullName || !email || !password) {
        return res.status(400).json({
            error: true,
            message: "Please provide full name, email and password",
        });
    }

    // Check if user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.status(400).json({
            error: true,
            message: "User already exists",
        });
    }

    // hash password 
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        fullName,
        email,
        password: hashedPassword,
    });

    // Save user account
    await user.save();

    const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "72h",
        }
    );

    return res.status(201).json({
        error: false,
        user: { fullName: user.fullName, email: user.email },
        accessToken,
        message: "Account created successfully",
    });
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // If null of fields
    if (!email || !password) {
        return res.status(400).json({
            error: true,
            message: "Please provide email and password",
        });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "User not found",
        });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid Credentials",
        });
    }

    const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "72h",
        }
    );

    return res.json({
        error: false,
        message: "Login successful",
        user: { fullName: user.fullName, email: user.email },
        accessToken,
    });
});

// Get user
app.get("/get-user", authenticateToken, async (req, res) => {
    const { userId } = req.user;

    const isUser = await User.findOne({ _id: userId });

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: isUser,
        message: ""
    });
});

// Add travel story
app.post("/add-travel-story", authenticateToken,async (req, res) => {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    // Validate required fields
    if(!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
        return res.status(400).json({ error: true, message: "Please provide all required fields" });
    }

    // Convert visitedDate from milliseconds to date object
    const parsedVisitedDate = new Date(parseInt(visitedDate));
    try {
        const travelStory = new TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parsedVisitedDate,
        });

        await travelStory.save();
        res.status(201).json({
            story: travelStory,
            message: "Travel story added successfully"
        });
    }
    catch (error) {
        return res.status(400).json({ error: true, message: error.message });
    }
});

// get all stories
app.get("/get-all-travel-stories", authenticateToken, async (req, res) => {
    try {
        const travelStories = await TravelStory.find().sort({
            isFavourite: -1
        });

        res.status(200).json({
            stories: travelStories
        });
    } catch (error) { 
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// upload image
app.post("/image-upload", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: "No image uploadede"
            });
        }

        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
        res.status(201).json({ imageUrl });
    }catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// delete the filename from the imageUrl
app.delete("/delete-image", async (req, res) => {
    const { imageUrl } = req.query;
    if (!imageUrl) {
        return res.status(400).json({
            error: true,
            message: "ImageUrl parameter is required"
        });
    }

    try {
        //extract the filename from the imageUrl
        const filename = path.basename(imageUrl);

        //define the file path
        const filePath = path.join(__dirname, 'uploads', filename);

        // check if the file exists
        if (fs.existsSync(filePath)) {
            // delete the file
            fs.unlinkSync(filePath);
            res.status(200).json({
                message: "Image deleted successfully"
            });
        } else {
            res.status(200).json({
                error: true,
                message: "Image not found"
            });
        }
    }catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// Serve static files from the uploads and assets directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Edit travel story
app.put("/edit-travel-story/:id", authenticateToken, async (req, res) => { 
    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    // Validate required fields
    if(!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
        return res.status(400).json({
            error: true,
            message: "Please provide all required fields"
        });
    }

    // Convert visitedDate from milliseconds to date object
    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try {
        // find the travel story by id ensure it belongs to the authentcated user
        const travelStory = await TravelStory.findOne({ _id: id, userId });
        
        if (!travelStory) {
            return res.status(404).json({
                error: true,
                message: "Travel story not found"
            });
        }

        const placeholderImgUrl = `http://localhost:8000/assets/TrendStories.png`;

        travelStory.title = title;
        travelStory.story = story;
        travelStory.visitedLocation = visitedLocation;
        travelStory.imageUrl = imageUrl || placeholderImgUrl;
        travelStory.visitedDate = parsedVisitedDate;

        await travelStory.save();
        res.status(200).json({
            story: travelStory,
            message: "Travel story updated successfully"
        });
    } catch (error){
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// delete travel story
app.delete("/delete-travel-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId });

        if (!travelStory) {
            return res.status(404).json({
                error: true,
                message: "Travel story not found"
            });
        }

        // Delete the travel story from the database
        await travelStory.deleteOne();

        // Extract the filename from the imageUrl
        const filename = path.basename(travelStory.imageUrl);

        // Define the file path
        const filePath = path.join(__dirname, 'uploads', filename);

        // Delete the image file from the uploads folder
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log("Error deleting file:", err);
            }
        });

        return res.status(200).json({
            error: false,
            message: "Travel story deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// Update isFavourite
app.put("/update-favourite/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { isFavourite } = req.body;
    const { userId } = req.user;

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

        if (!travelStory) {
            return res.status(404).json({
                error: true,
                message: "Travel story not found"
            });
        }

        travelStory.isFavourite = isFavourite;
        await travelStory.save();

        return res.status(200).json({
            story: travelStory,
            message: "Travel story updated successfully"
        });
    }catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

//search travel stories
app.get("/search-travel-stories", authenticateToken, async (req, res) => {
    const { query } = req.query;
    const { userId } = req.user;

    if (!query) {
        return res.status(400).json({
            error: true,
            message: "Please provide a search query"
        });
    }
    
    try {
        const searchResults = await TravelStory.find({
            userId: userId,
            $or: [
                { title: { $regex: query, $options: "i" } },
                { story: { $regex: query, $options: "i" } },
                { visitedLocation: { $regex: query, $options: "i" } }
            ],
        }).sort({ isFavourite: -1 });
        res.status(200).json({
            stories: searchResults
        });
    }catch (error) {
        res.status(500).json({
            error: true,            
            message: error.message
        });
    }
});

// filter travel stories
app.get("/filter-travel-stories/filter", authenticateToken, async (req, res) => { 
    const { startDate, endDate } = req.query;
    const { userId } = req.user;

    try {
        //convert startdate and enddate to date objects
        const start = new Date(parseInt(startDate));
        const end = new Date(parseInt(endDate));

        //find travel story that belong the authencated user and fall within the date eange 
        const filterdStories = await TravelStory.find({
            userId: userId,
            visitedDate: {
                $gte: start,
                $lte: end
            },
        }).sort({ isFavourite: -1 });
        res.status(200).json({
            stories: filterdStories
        });
    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message
        });
    }
});

// Start server
app.listen(8000);
module.exports = app;
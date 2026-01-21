import express from "express";            // Express framework for building the server
import cors from "cors";                  // CORS middleware for cross-origin requests
import cookieParser from "cookie-parser"; // Parses cookies from incoming requests
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js"
import dotenv from 'dotenv';
dotenv.config();

const app = express();                    // Create Express application instance

const port = process.env.PORT || 4000;    // Use PORT from env or fallback to 4000
connectDB();

app.use(express.json());                  // Parse incoming JSON request body
app.use(cookieParser());                  // Enable cookie parsing
app.use(cors({ credentials: true }));     // Allow CORS with credentials (cookies)


//API Endpoints
app.get("/", (req, res) =>                // Basic route to verify API is running
    res.send("API working")
);
app.use('/api/auth', authRouter);

app.listen(port, () => {                  // Start server on defined port
    console.log(`Server is running on port : ${port}`);
}); 
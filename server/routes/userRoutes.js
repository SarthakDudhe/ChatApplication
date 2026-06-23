import express from "express"
import { checkAuth, login, signup, updateProfile, getChatbotResponse } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const userRouter=express.Router();

//Rate limiter for auth routes - 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});


userRouter.post('/signup',authLimiter,signup);
userRouter.post('/login',authLimiter,login);
userRouter.put('/update-profile',protectRoute,updateProfile);
userRouter.get('/check',protectRoute,checkAuth);
userRouter.post('/chatbot',protectRoute,getChatbotResponse);


export default userRouter;
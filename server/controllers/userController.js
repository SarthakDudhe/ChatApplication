import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
//Signup a new user
export const signup=async(req,res)=>{

    const {fullname,email,password,bio}=req.body;
try {
    if (!fullname || !email || !password || !bio) {
        return res.json({success:false,message:"Missing Details"})
    }

const user=await User.findOne({email});

if (user) {
    return  res.json({success:false,message:"Account already exists"})
}
 const salt= await bcrypt.genSalt(10);
 const hashedPassword =await bcrypt.hash(password,salt);

const newUser=await User.create({
    fullname,email,password:hashedPassword,bio
})

const token= generateToken(newUser._id)

res.json({success:true,userData:newUser,token, message:"Account Created Successfully"})


} catch (error) {
    console.log(error)
    return res.json({success:false,message:error.message})
}
    
}




//Controller to login User


export const login =async (req,res) => {

    try {
        const {email,password} = req.body;
        const userData=await User.findOne({email});
        const isPasswordCorrected= await bcrypt.compare(password,userData.password);

        if (!isPasswordCorrected) {
            return res.json({success:false,message:"Invalid Credentials"})

        }

        const token=generateToken(userData._id)

        res.json({success:true,userData,token,message:"Login Successful"})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
    
}

//Controller to check if user is authenticated ? 

export const checkAuth=(req,res)=>{
  res.json({success:true,user:req.user})
}


//Controller to update user profile details

export const updateProfile = async (req,res) => {
    try {
        const {profilePic,bio,fullname}=req.body;
        const userId =req.user._id;

        let updatedUser;
        if (!profilePic) {
            updatedUser=await User.findByIdAndUpdate(userId,{bio,fullname},{new:true});
        }
        else{
            const upload=await cloudinary.uploader.upload(profilePic);

            updatedUser=await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullname},{new:true})
        }

        res.json({success:true,user:updatedUser})
    } catch (error) {
        console.log(error.message);
          res.json({success:false,message:error.message})
    }
}

// Controller to get chatbot response using Groq API
export const getChatbotResponse = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, message: "Invalid or missing messages list" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "GROQ_API_KEY is not configured on the server" });
        }

        // Limit context to last 15 messages (sliding window)
        const recentMessages = messages.slice(-15);

        // Format history for Groq API
        const formattedMessages = [
            {
                role: "system",
                content: "You are Dialogue Bot, a helpful, premium AI assistant inside the Dialogue enterprise chat application. Help users with questions about Dialogue (client-side AES-256 E2EE encryption, Socket.io real-time indicators, group admin, local development, etc.) or general questions. Answer concisely and professionally."
            },
            ...recentMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }))
        ];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: formattedMessages,
                temperature: 0.7,
                max_completion_tokens: 512,
                top_p: 1,
                stream: true
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || "Failed to initialize Groq stream";
            console.error("Groq API error response:", errMsg);
            return res.status(500).json({ success: false, message: errMsg });
        }

        // Set headers for chunked streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        if (response.body && typeof response.body.getReader === 'function') {
            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const cleanedLine = line.trim();
                    if (!cleanedLine) continue;
                    if (cleanedLine === "data: [DONE]") continue;
                    if (cleanedLine.startsWith("data: ")) {
                        try {
                            const json = JSON.parse(cleanedLine.slice(6));
                            const text = json.choices?.[0]?.delta?.content || "";
                            if (text) {
                                res.write(text);
                            }
                        } catch (err) {
                            // ignore partial JSON parse errors
                        }
                    }
                }
            }
        } else if (response.body) {
            // Node-style stream or async iterable fallback
            for await (const chunk of response.body) {
                buffer += decoder.decode(chunk, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const cleanedLine = line.trim();
                    if (!cleanedLine) continue;
                    if (cleanedLine === "data: [DONE]") continue;
                    if (cleanedLine.startsWith("data: ")) {
                        try {
                            const json = JSON.parse(cleanedLine.slice(6));
                            const text = json.choices?.[0]?.delta?.content || "";
                            if (text) {
                                res.write(text);
                            }
                        } catch (err) {
                            // ignore partial JSON parse errors
                        }
                    }
                }
            }
        }

        // Send any remaining data in the buffer
        if (buffer) {
            const cleanedLine = buffer.trim();
            if (cleanedLine && cleanedLine !== "data: [DONE]" && cleanedLine.startsWith("data: ")) {
                try {
                    const json = JSON.parse(cleanedLine.slice(6));
                    const text = json.choices?.[0]?.delta?.content || "";
                    if (text) {
                        res.write(text);
                    }
                } catch (err) {
                    // ignore
                }
            }
        }

        res.end();
    } catch (error) {
        console.error("Chatbot controller error:", error);
        // If headers are already sent, we cannot send a json response
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        } else {
            res.end();
        }
    }
}



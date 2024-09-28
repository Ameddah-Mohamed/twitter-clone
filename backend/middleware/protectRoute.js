import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided ( You are Logged Out)" });
		}

        //if everything is alright it returns the payload
		const payload = jwt.verify(token, process.env.JWT_SECRET);

        if(!payload){
            res.json({
                error: "Invalid Token, You Can't Proceed further, Login  First."
            })
        }
        
        const user = await User.findById(payload.userId);
        if(user){
            req.user = user;
            next();
        }
        else{
            res.status(404).json({
                error: "Can't Find User"
            })
        }
	} catch (err) {
		console.log("Error in protectRoute middleware", err.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export  default protectRoute;
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../lib/utils/generateToken.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) =>{
    try {
        const {username, fullName, email, password} = req.body;
        const emailRegex =  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

        //Email Validation
        if(!emailRegex.test(email)){
            return res.status(400).json({error: "ERROR: Invalid Email.."})
        }

        //Username Validation
        const existingUsername = await User.findOne({username: username});
        if( existingUsername ){
            return res.status(400).json({error: "ERROR: Username Already Exists.."});
        }

        //Email Validation
        const existingEmail = await User.findOne({email: email});
        if( existingEmail ){
            return res.status(400).json({error: "ERROR: Email Already Exists.."})
        }

        if(password.length < 6) return res.status(400).json({
            error: "Too Weak, password must contain more than 6 Characters."
        })

        //Hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        //Creating the new User.
        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword
        });

        //Responsible for sending the token to the user in a cookie.
        generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();
        res.status(201).json({
          _id: newUser._id,
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          followers: newUser.followers,
          following: newUser.following,
          profileImg: newUser.profileImg,
          coverImg: newUser.coverImg,
        });
      } catch (error) {
        console.error("ERROR Signing up:", error.message);
        res.status(500).json({ error: error.message });
      }
}

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });

		// Check if the user exists
		if (!user) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// Check if the password is correct
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// Generate token and set cookie
		generateTokenAndSetCookie(user._id, res);

		// Send user details in the response
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
    try {
        // Check if the JWT cookie exists
        if (!req.cookies.jwt) {
            return res.status(400).json({ error: "You are already logged out." });
        }

        // Clear the JWT cookie
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({ message: "Logged Out Successfully!" });
    } catch (error) {
        console.log("ERROR in Log out Controller", error.message);
        res.status(500).json({ error: "Error Logging out" });
    }
};


export const getMe = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.json(user);
    }
    catch(error){
        console.log("ERROR in getMe Controller");
        res.status(500).json({error: "Internal Server Error"});
    }
}
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    fullName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    //curly brackets because it's an list of followers not just one
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId, // reference to the user model.
            ref: "User",
            default: []
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId, // reference to the user model.
            ref: "User",
            default: []
        }
    ],

    profileImg: {
        type: String,
        default: ""
    },

    coverImg: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        default: ""
    },

    link: {
        type: String,
        default: ""
    },
    //note: posts, user has liked.
    likedPosts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            default: []
        }
    ]

    

},{timestamps:true})


//Creating the model.
const User = mongoose.model("User", userSchema);

//exporting the User model for use in other files.
export default User;
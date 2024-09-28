import mongoose from "mongoose";
import User from "./user.model.js";


const notficationSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    type:{
        type: String,
        required: true,
        enum: ["follow", "like"]
    },
    read: {
        type: Boolean,
        default: false
    }

}, {timestamps:true})

const Notification = mongoose.model("Notification", notficationSchema);
export default Notification;
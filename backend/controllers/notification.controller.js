import Notification from "../models/notification.model.js"


//get the current logged in user notifications.
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({to:userId}).sort({createdAt: -1})
        .populate({
            path: "from",
            select: "username profileImg"
        });

        await Notification.updateMany({to:userId}, {read: true});
        return res.status(200).json(notifications);
        
    } catch (error) {
        console.log("ERROR in the notification controller. error: ", error.message);
        return res.json({error: "Internal Server Error"});
    }
};

export const deleteNotifications = async (req, res) => {
    const userId = req.user._id; 
    try {
        
        await Notification.deleteMany({to: userId});
        return res.status(200).json({message: "Notifications cleared !"});
        
    } catch (error) {
        console.log("ERROR in the deleteNotifications controller. error: ", error.message);
        return res.json({error: "Internal Server Error"});
    }
}
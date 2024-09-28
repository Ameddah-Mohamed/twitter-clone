import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";


export const getUserProfile = async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      res.status(404).json({ error: "User Not Found.." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in the getUserProfile In The User Controller");
    res.json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  const userToModify = User.findById(id);
  const currentUser = req.user;

  if (id == currentUser._id) {
    res.status(400).json({ error: "You Can't Follow/ Unfollow Yourself :)" });
    return;
  }

  if (!userToModify) {
    res.json(`Can not find user with id : ${id} `);
    return;
  }

  // note: The includes function is a method available on arrays in JavaScript. It checks if a given value exists within an array and returns a boolean value (true or false).
  const isFollowing = currentUser.following.includes(id);

  if (isFollowing) {
    //Unfollow The User
    await User.findByIdAndUpdate(currentUser._id, { $pull: { following: id } }); // or currentUser.following.pull(id);
    await User.findByIdAndUpdate(id, { $pull: { followers: currentUser._id } }); // or userToModify.followers.pull(currentUser._id);
    console.log(`user with the id : ${id} unfollowed Successfully`);
    res.json({ message: "User UnFollowed Successfully" });
  } else {
    //follow the user
    await User.findByIdAndUpdate(id, { $push: { followers: currentUser._id } });
    await User.findByIdAndUpdate(currentUser._id, { $push: { following: id } });

    const notification = new Notification({
      from: currentUser._id,
      to: id,
      type: "follow",
    });

    await notification.save();
    console.log(`user with the id : ${id} followed Successfully`);
    res.json({ message: "User Followed Successfully" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    //note: get an object : {following: [object_Ids]}
    const usersFollowedByMe = await User.findById(userId).select("following");

    //note: get all the users except myself.
    //note: the aggregate return js objects wla arrays not 7wayj ta3 mongoose
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    //users not followed by me.
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("ERROR in getSuggestedUser", error.message);
    res.status(500).json({ error: error.message });
  }
};


export const updateUser = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

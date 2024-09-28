import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const data = {
    fullName: "John Doe",
    username: "johndoe",
    profileImg: "/avatars/boy1.png",
  };

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      return data;
    },
    onSuccess: () => {
      // Immediately remove the auth user data.
      queryClient.setQueryData(["authUser"], null); // Clear the authUser state
      //note: when authUser state changes, the app component gets re rendered and those conditions in the app.jsx gets executed and the routing happens, so there is no need to navigate() to the login page.
      toast.success("Logged Out Successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="top-0 left-0 h-screen min-w-12 w-18 max-w-52 md:flex-[2_2_0] px-3 sticky">
      <div className="flex flex-col h-full justify-around items-center py-10">
        {/* top part */}
        <div className="flex flex-col flex-1 gap-10 items-center">
          {/* Logo */}

          <Link to="/">
            <XSvg className="fill-white w-10" />
          </Link>

          <div className="flex flex-col gap-4">
            <Link to="/" className="flex gap-3 items-center">
              <MdHomeFilled size={25} />
              <span className="hidden sm:block text-slate-200 font-medium">
                Home
              </span>
            </Link>

            <Link to="/notifications" className="flex gap-3 items-center">
              <IoNotifications size={25} />
              <span className="hidden sm:block text-slate-200 font-medium">
                Notifications
              </span>
            </Link>

            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center"
            >
              <FaUser size={25} />
              <span className="hidden sm:block text-slate-200 font-medium">
                Profile
              </span>
            </Link>
          </div>
        </div>

        {/* bottom part */}
        <div className="mb-4">
          {data && (
            <Link to={`/profile/${authUser.username}`}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <img
                  src={authUser.profileImg || "/avatar-placeholder.png"}
                  alt="profile-img"
                  className="w-12 h-12 object-cover rounded-full"
                />

                <div className="flex-col hidden sm:flex">
                  <p>{authUser.fullName}</p>
                  <p className="text-gray-500">@{authUser.username}</p>
                </div>
                <button
                  onClick={(event) => {
                    event.preventDefault(); // Prevent default link behavior
                    event.stopPropagation(); // Ensure the click event doesn't bubble up
                    logout(); // Call the logout mutation
                  }}
                  className="flex items-center gap-3"
                >
                  <BiLogOut size={20} />
                </button>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

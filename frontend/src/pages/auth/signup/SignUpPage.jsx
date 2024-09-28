import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
const SignUpPage = () => {
  const navigate = useNavigate();
  const [FormData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, fullName, password }) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, fullName, password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to create account");
        toast.success("Account created successfully");
        console.log(data);
        navigate("/");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      {
        /* Added this line below, after recording the video. I forgot to add this while recording, sorry, thx. */
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmitting = (event) => {
    event.preventDefault(); //page don't reload.
    mutate(FormData);
  };

  const handleInputChanging = (event) => {
    const newFormData = {
      ...FormData,
      [event.target.name]: event.target.value,
    };
    setFormData(newFormData);
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto h-screen px-10 flex items-center gap-24">
        {/* ----------- X icon  ------------*/}
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <XSvg className="lg:w-full fill-white" />
        </div>

        {/* ----------- Form  ------------*/}
        <div className="flex-1 flex flex-col gap-8">
          {/* ----------- X icon for smaller screens  ------------*/}
          <div className="flex-1 lg:hidden flex items-center justify-center">
            <XSvg className="w-24 fill-white" />
          </div>

          <h1 className="text-center text-3xl font-extrabold">Join Us Today</h1>

          {/* ----------- Actual Form  ------------*/}
          <form className="flex flex-col gap-4" onSubmit={handleSubmitting}>
            {/* username */}
            <label className="input input-bordered flex items-center gap-2">
              <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="Username"
                name="username"
                value={FormData.username}
                onChange={handleInputChanging}
                autoComplete="username"
              />
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="fullName"
                name="fullName"
                value={FormData.fullName}
                onChange={handleInputChanging}
                autoComplete="username"
              />
            </label>

            {/* email */}
            <label className="input input-bordered flex items-center gap-2">
              <MdOutlineMail />
              <input
                type="email"
                className="grow"
                placeholder="Email"
                name="email"
                value={FormData.email}
                onChange={handleInputChanging}
                autoComplete="email"
              />
            </label>

            {/* password */}
            <label className="input input-bordered flex items-center gap-2">
              <MdPassword />
              <input
                type="password"
                className="grow"
                name="password"
                placeholder="password"
                value={FormData.password}
                onChange={handleInputChanging}
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              className="bg-custom-blue hover:bg-hoverBlue active:bg-activeBlue text-white font-bold py-2 px-4 rounded-full transition duration-300 ease"
              onSubmit={handleInputChanging}
            >
              {isPending ? "Loading .." : "Sign Up"}
            </button>
          </form>

          {isError && (
            <p className="text-center text-sm text-red-500 font-extralight w-60">
              {error.message}
            </p>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-center text-gray-400">
              {"Already"} have an account?
            </p>
            <Link to="/login">
              <button className="btn rounded-full btn-primary text-white btn-outline w-full">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;

import { Link } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../../components/svgs/X";

import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      // refetch the authUser
      toast.success("Logged in Successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

          <h1 className="text-center text-3xl font-extrabold">Welcome Back!</h1>

          {/* ----------- Actual Form  ------------*/}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* username */}
            <label className="input input-bordered flex items-center gap-2">
              <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
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
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              className="bg-custom-blue hover:bg-hoverBlue active:bg-activeBlue text-white font-bold py-2 px-4 rounded-full transition duration-300 ease"
            >
              {isPending ? "Loading.." : "Login"}
            </button>
          </form>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-center text-gray-400">
              {"Don't"} have an account?
            </p>
            <Link to="/signup">
              <button className="btn rounded-full btn-primary text-white btn-outline w-full">
                Sign up
              </button>
            </Link>
            {isError && <p className="text-red-500">{error.message}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

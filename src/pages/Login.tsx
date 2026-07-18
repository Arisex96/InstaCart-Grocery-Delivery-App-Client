import React, { useState } from "react";
import hero_bg from "../assets/hero_bg.jpeg";
import {
  BikeIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  Loader2Icon
} from "lucide-react";
const Login = () => {

  const [showSignin, setShowSignin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
  <div className="min-h-screen flex">
    {/* Left Side */}
    <div className="hidden lg:flex w-1/2 bg-app-green relative items-center justify-center">
      <img
        src={hero_bg}
        alt=""
        className="absolute inset-0 object-cover h-full w-full opacity-10"
      />

      <div className="relative z-10 text-center px-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to InstaCart
        </h1>

        <p className="text-lg text-emerald-100/80">
          Fresh Groceries, Delivered at Your Doorstep
        </p>
      </div>
    </div>

    {/* Right Side */}
    <div className="flex w-full lg:w-1/2 items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col gap-5">
          <div className="flex gap-2 justify-center items-center">
            <BikeIcon className="w-10 h-10 text-emerald-700" />
            <div className="text-3xl font-bold text-emerald-700">
              InstaCart
            </div>
          </div>

          <div className="text-2xl font-semibold text-center">
            {showSignin ? "Sign in to your account" : "Create an account"}
          </div>

          <div className="text-sm text-center text-gray-600">
            {showSignin
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <span
              onClick={() => setShowSignin(!showSignin)}
              className="text-emerald-600 hover:underline cursor-pointer font-medium"
            >
              {showSignin ? "Sign Up" : "Sign In"}
            </span>
          </div>

          {/* Name */}
          {!showSignin && (
            <>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>

              <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </>
          )}

          {/* Email */}
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>

          <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <MailIcon className="w-5 h-5 text-gray-400" />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none bg-transparent"
            />
          </div>

          {/* Password */}
          <label className="text-sm font-medium text-gray-700">
            Password
          </label>

          <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <LockIcon className="w-5 h-5 text-gray-400" />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none bg-transparent"
            />
          </div>

          <button
            onClick={showSignin ? handleSignin : handleSignup} disabled={loading}
            className="w-full mt-5 rounded-lg bg-emerald-700 py-2.5 text-white font-semibold hover:bg-emerald-800 transition cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <Loader2Icon className="w-5 h-5 animate-spin" />
            ) : showSignin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;


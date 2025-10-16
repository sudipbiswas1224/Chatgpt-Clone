import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../services/api";
import { useNavigate } from "react-router-dom";


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    // Shape payload to match backend expectations if needed
    const payload = {
      email: values.email,
      password: values.password,
      fullName: { firstName: values.firstName, lastName: values.lastName },
    };
    console.log("Submitting:", payload);
    // TODO: call your API here and handle result
    try {
      const response = await api.post("/auth/register", 
        payload
      );
      console.log(response)
     if(response.status === 201) {
      toast.success("Registration successful!");
     }
      // Handle success (e.g., show message, redirect)
      reset();
      navigate('/login')
    } catch (error) {
      // Handle error (e.g., show error message)
      if(error?.response?.status === 400) {
        toast.error('User already exists Please login')
      }
      else {
        toast.error(error.message)
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-100">
      <div className="w-full max-w-[90%] md:max-w-md bg-neutral-950/80 backdrop-blur rounded-2xl border border-neutral-800 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <h2 className="text-3xl font-semibold text-center mb-7 tracking-tight">
          Create Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm mb-1 text-neutral-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /[^\s@]+@[^\s@]+\.[^\s@]+/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm mb-1 text-neutral-300">
                First Name
              </label>
              <input
                type="text"
                placeholder="First name"
                className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent"
                {...register("firstName", {
                  required: "First name is required",
                })}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <label className="block text-sm mb-1 text-neutral-300">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last name"
                className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-neutral-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="w-full pr-11 px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200 focus:outline-none"
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.338 6.4 18 12 18c1.508 0 2.83-.216 3.997-.6m3.023-1.688C21.056 14.77 22.066 13.495 22.066 12 20.774 8.662 17.6 6 12 6c-.73 0-1.418.053-2.066.154M3 3l18 18"
                    />
                  </svg>
                ) : (
                  // Eye icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.364 5 12 5c4.637 0 8.578 2.51 9.964 6.678.07.2.07.444 0 .644C20.578 16.49 16.637 19 12 19c-4.636 0-8.577-2.51-9.964-6.678z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Register"}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2.5 rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-900"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

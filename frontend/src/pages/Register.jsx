import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const Register = () => {
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
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      // Handle success (e.g., show message, redirect)
      toast.success("Registration successful!");
      reset();
    } catch (error) {
      // Handle error (e.g., show error message)
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-100">
      <div className="w-full max-w-md bg-neutral-950/80 backdrop-blur rounded-2xl border border-neutral-800 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
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
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
            />
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

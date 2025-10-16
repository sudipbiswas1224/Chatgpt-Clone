import { Link } from "react-router-dom";



const Home = () => {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          AurionGPT
        </h1>
        <p className="text-xl text-neutral-400">
          Your AI-powered conversation assistant
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link
            to="/login"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

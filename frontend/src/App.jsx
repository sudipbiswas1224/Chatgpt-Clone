import React from "react";
import Mainroutes from "./routes/Mainroutes";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <div className="App bg-gray-800 text-white min-h-screen w-full">
      <Mainroutes />
      <ToastContainer />
    </div>
  );
};

export default App;

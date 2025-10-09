import React from "react";
import { IoSend } from "react-icons/io5";
// Composer
// Message input area with submit (Enter) handling and send button.
// Props:
// - message: current draft text
// - setMessage: setter for draft
// - onSend: callback to send message
export function Composer({ message, setMessage, onSend }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      className="p-4 border-t border-neutral-800 bg-transparent backdrop-blur"
    >
      <div className="max-w-4xl mx-auto flex items-center gap-4 h-full">
        <div className="flex-1">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything"
            className="w-full rounded-full bg-[#121212] border border-[#2a2a2a] px-6 py-3 text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
        </div>
        <button
          type="submit"
          className=" h-full w-12 rounded  bg-gray-900 hover:bg-gray-800 flex items-center justify-center text-white shadow-md"
          aria-label="Send"
        >
          <IoSend />
        </button>
      </div>
    </form>
  );
}

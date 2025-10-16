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
        <div className="w-full flex items-center justify-between border border-white rounded-full px-3 py-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything"
            className="w-[90%] bg-transparent px-3 py-2 text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none "
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />

          <button
            type="submit"
            className=" h-10 w-10 rounded-full   bg-transparent hover:bg-gray-800 flex items-center justify-center text-white shadow-md"
            aria-label="Send"
          >
            <IoSend />
          </button>
        </div>
      </div>
    </form>
  );
}

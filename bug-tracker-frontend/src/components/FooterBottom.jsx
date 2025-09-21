import React from "react";

export default function FooterBottom() {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3">
      <p className="text-center text-sm text-gray-600 dark:text-gray-300">
        © {new Date().getFullYear()} Made by Harshit |{" "}
        <a
          href="mailto:harshitkumar2045@gmail.com"
          className="text-indigo-600 hover:underline"
        >
          harshitkumar2045@gmail.com
        </a>{" "}
        |{" "}
        <a
          href="https://www.harshitdev.space"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          https://www.harshitdev.space
        </a>
      </p>
    </div>
  );
}

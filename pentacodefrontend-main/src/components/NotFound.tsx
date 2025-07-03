import React from "react";
import Navbar from "./Navbar";

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 mb-4">
                <img src="/hurricane_image.png" alt="Logo" className="w-12 h-12" />
                <h1 className="text-3xl font-bold text-orange-600">HURRICANE</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">404 - Page Not Found</h2>
            <p className="text-gray-600 mt-2">
                Sorry, the page you are looking for does not exist.
            </p>
            <a
                href="/"
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
            >
                Go Back Home
            </a>
        </div>
    );
};

export default NotFound;
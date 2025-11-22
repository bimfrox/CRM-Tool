import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-extrabold text-gray-800">404</h1>
        <p className="mb-6 text-lg text-gray-600">
          Oops! Page not found
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

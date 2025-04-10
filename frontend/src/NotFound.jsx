import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-lg mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">
        Go Back Home
      </Link>
    </div>
  );
}

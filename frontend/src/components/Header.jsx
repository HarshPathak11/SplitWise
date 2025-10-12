import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Header({ title, backPath }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={() => navigate(-1)}
        className="text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
    </div>
  );
}
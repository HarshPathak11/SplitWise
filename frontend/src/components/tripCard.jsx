import PropTypes from "prop-types";

export default function TripCard({ trip, onClick, amount }) {
  // console.log(trip)
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  // const date = new Date(time).toLocaleString('en-US', options);
  return (
    <div
      key={trip.id}
      onClick={onClick}
      className="group relative p-3 sm:p-4 bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 hover:border-indigo-500/30 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden"
    >
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform pointer-events-none"></div>

      <div className="flex justify-between items-center relative z-10">
        {/* Left: Icon & Details */}
        <div className="flex items-center gap-3">
          {/* Trip Icon Box */}
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300 shadow-inner shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-zinc-100 text-sm truncate pr-2 group-hover:text-indigo-200 transition-colors">
              {trip.name}
            </h3>
          </div>
        </div>

        {/* Right: Amount */}
        <div className="text-right shrink-0">
          <div className="text-lg font-mono font-medium text-white tracking-tight">
            ₹{amount?.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

import PropTypes from "prop-types";

export default function TripCard({ trip, onClick, amount }) {
  // console.log(trip)
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  // const date = new Date(time).toLocaleString('en-US', options);
  return (
    <div
      key={trip.id}
      className="bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30 p-2 sm:p-3"
      onClick={onClick} // Redirect to TripDetails on click
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-sm">{trip.name}</h3>
        <span>{trip.from && <span className="text-xs text-gray-400">{new Date(trip.from).toLocaleString('en-US', options)}</span>} {trip.to && trip.from &&'-'} {trip.to && <span className="text-xs text-gray-400">{new Date(trip.to).toLocaleString('en-US', options)}</span>}</span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">
          Participants: {trip.members?.length || 0}
        </p>
        <div className="text-lg font-semibold">₹{amount?.toFixed(2)}</div>
      </div>
      
    </div>
  );
}
import PropTypes from "prop-types";

export default function TripCard({ trip, onClick }) {
  return (
    <div
      key={trip.id}
      className="bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30 p-2 sm:p-3"
      onClick={onClick} // Redirect to TripDetails on click
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-sm">{trip.name}</h3>
        <span className="text-xs text-gray-400">{trip.date}</span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">
          Participants: {trip.members?.length || 0}
        </p>
      </div>
    </div>
  );
}
TripCard.propTypes = {
  trip: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    participants: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    totalAmount: PropTypes.number.isRequired,
    members: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

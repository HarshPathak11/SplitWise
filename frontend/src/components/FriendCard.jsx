import PropTypes from "prop-types";
import { FaTrash } from "react-icons/fa";

const FriendCard = ({ friend, index, handleDeleteFriend }) => {
  return (
    <div
      key={index}
      className="bg-gray-700/50 backdrop-blur-sm cursor-pointer rounded-lg border border-gray-600/30 p-2 sm:p-3 flex justify-between items-center"
    >
      <div>
        <p className="text-sm text-white">{friend.username}</p>
        <p
          className={`text-xs ${
            friend.balance > 0
              ? "text-green-400"
              : friend.balance < 0
              ? "text-red-400"
              : "text-gray-400"
          }`}
        >
          {friend.balance > 0
            ? `Owes you ₹${friend.balance}`
            : friend.balance < 0
            ? `You owe ₹${Math.abs(friend.balance)}`
            : "Settled"}
        </p>
      </div>
      <button
        onClick={() => handleDeleteFriend(friend.name)}
        className="text-red-500 hover:text-red-700 transition-colors"
        title="Remove Friend"
      >
        <FaTrash className="h-5 w-5" />
      </button>
    </div>
  );
};
FriendCard.propTypes = {
  friend: PropTypes.shape({
    name: PropTypes.string.isRequired,
    balance: PropTypes.number.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleDeleteFriend: PropTypes.func.isRequired,
};

export default FriendCard;

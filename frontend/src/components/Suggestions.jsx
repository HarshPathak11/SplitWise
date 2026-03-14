import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Suggestions({
  suggestions,
  loading,
  onSendFriendRequest,
  onScroll,
  listRef,
}) {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-800 p-2 rounded-xl bg-zinc-900/30 flex flex-col">
    <div className="flex flex-col md:flex-[0.4] min-h-0">
      <h3 className="text-xl font-semibold text-white mb-2">Suggested Friends</h3>
      <div
        ref={listRef}
        onScroll={onScroll}
        className="h-64 overflow-y-auto space-y-3 pr-2 pb-2 scrollbar-hide"
      >
        {suggestions.length === 0 && loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading suggestions...</p>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <motion.div
              key={suggestion.user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {suggestion.user.profilePhotoUrl ? (
                  <img
                    src={suggestion.user.profilePhotoUrl}
                    alt={suggestion.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-indigo-400 font-bold text-sm">
                      {suggestion.user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{suggestion.user.username}</p>
                  <p className="text-gray-400 text-sm">
                    {suggestion.mutualFriends} mutual friend{suggestion.mutualFriends !== 1 ? "s" : ""}
                    {suggestion.recentlyJoined && " • Recently joined"}
                  </p>
                </div>
              </div>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors duration-200"
                onClick={() => onSendFriendRequest(suggestion.user._id)}
              >
                Add Friend
              </button>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No suggestions available</p>
          </div>
        )}

      </div>
        <div className="text-center mt-2">
          <button
            onClick={() => navigate("/addFriend")}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all duration-200"
          >
            Invite Contacts
          </button>
        </div>
    </div>
</div>
  );
}

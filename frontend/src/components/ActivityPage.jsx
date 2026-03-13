import { useState, useEffect } from "react";
import { Bell, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import ActivityItems from "./ActivityItems";

const ActivityPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const LIMIT = 20;

  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        await fetchNotifications();
        await markAllAsReadOnOpen();
        await fetchUnreadCount();
      };
      loadData();
    }
  }, [userId]);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/activity/${userId}`, {
        params: { page: pageNum, limit: LIMIT },
      });
      const { notifications: data, pagination } = response.data;

      if (pageNum === 1) {
        setNotifications(data);
      } else {
        setNotifications((prev) => [...prev, ...data]);
      }

      setHasMore(pagination.page < pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(`/activity/${userId}/unread-count`);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAllAsReadOnOpen = async () => {
    try {
      await api.put(`/activity/${userId}/read-all`);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read on open:", error);
    }
  };

  const handleDeleteAll = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeletingAll(true);
    try {
      await api.delete(`/activity/${userId}/all`);
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications deleted");
    } catch (error) {
      console.error("Error deleting notifications:", error);
      toast.error("Failed to delete notifications");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  };

  const handleStatusChange = () => {
    fetchUnreadCount();
  };

  const handleBack = () => {
    navigate("/dash");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all duration-200"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Bell size={28} className="text-indigo-400" />
              Activity
            </h1>
            <div className="w-10"></div>
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 animate-pulse">
              <Bell size={32} className="text-indigo-400" />
            </div>
            <p className="text-gray-400">Loading activity...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
              <Bell size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No activity yet
            </h2>
            <p className="text-gray-400">
              When something happens, you'll see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification) => (
                <ActivityItems
                  key={notification._id}
                  _id={notification._id}
                  sender={notification.sender}
                  message={notification.message}
                  type={notification.type}
                  createdAt={notification.createdAt}
                  isRead={notification.isRead}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all duration-200 disabled:opacity-50 font-medium mt-4"
              >
                {loading ? "Loading..." : "Load More"}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete All Notifications</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete all notifications? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-zinc-600 hover:bg-zinc-500 text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeletingAll}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingAll ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityPage;

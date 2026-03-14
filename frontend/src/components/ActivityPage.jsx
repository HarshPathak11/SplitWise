import { useState, useEffect, useRef } from "react";
import { Bell, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import ActivityItems from "./ActivityItems";
import Suggestions from "./Suggestions";

const handleScrollTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

const ActivityPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsPage, setSuggestionsPage] = useState(1);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);
  const suggestionsListRef = useRef(null);
  const activityListRef = useRef(null);

  const LIMIT = 3; // Only show 3 activities at a time in the scrollable container

  useEffect(() => {
    handleScrollTop();
  }, []);

  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        await fetchNotifications();
        await markAllAsReadOnOpen();
        await fetchUnreadCount();
        await fetchSuggestions();
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

  const fetchSuggestions = async (pageNum = 1) => {
    try {
      setSuggestionsLoading(true);
      const response = await api.get(`/user/friend-suggestions/${userId}`, {
        params: { page: pageNum, limit: 4 },
      });
      const { suggestions: data, pagination } = response.data;

      if (pageNum === 1) {
        setSuggestions(data);
      } else {
        setSuggestions((prev) => [...prev, ...data]);
      }

      setHasMoreSuggestions(pagination.hasMore);
      setSuggestionsPage(pageNum);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const sendFriendRequest = async (target) => {
    try {
      const payload = { fromUserId: userId };
      if (target?.userId) {
        payload.toUserId = [target.userId];
      } else if (target?.id) {
        payload.toUserId = [target.id];
      } else if (typeof target === 'string') {
        payload.toUserId = [target];
      } else if (target?.email) {
        payload.toEmail = [target.email];
      } else {
        toast.error('Invalid friend target');
        return;
      }

      const response = await api.post('/user/friend-requests/send', payload);
      if (response.status === 200) {
        toast.success('Friend request sent!');
        // Remove from suggestions
        setSuggestions((prev) => prev.filter((s) => s.user._id !== target && s.user._id !== target?.userId && s.user._id !== target?.id));
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
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

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  };

  const handleActivityScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      handleLoadMore();
    }
  };

  const handleLoadMoreSuggestions = () => {
    if (hasMoreSuggestions && !suggestionsLoading) {
      fetchSuggestions(suggestionsPage + 1);
    }
  };

  const handleSuggestionsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      handleLoadMoreSuggestions();
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
      <div className="bg-zinc-950 text-zinc-100 p-4 md:p-8 md:pb-8 relative selection:bg-indigo-500/30 font-sans">
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
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 animate-pulse">
                <Bell size={32} className="text-indigo-400" />
              </div>
              <p className="text-gray-400">Loading activity...</p>
            </div>
          ) : (
            <>
              {/* Activity list (60% height) */}
              <div className="border border-gray-800 p-2 rounded-xl bg-zinc-900/30 flex flex-col">
                <div className="flex flex-col flex-1 md:flex-[0.6] min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-white">Activity</h2>
                    {unreadCount > 0 && (
                      <span className="text-sm text-indigo-200">{unreadCount} unread</span>
                    )}
                  </div>
                  <div
                    ref={activityListRef}
                    onScroll={handleActivityScroll}
                    className="h-64 overflow-y-auto space-y-3 pr-2 pb-2 scrollbar-hide"
                  >
                    {notifications.length === 0 ? (
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
                    )}


                  </div>
                </div>
              </div>
              {/* Suggestions (40% height) */}
              <Suggestions
                suggestions={suggestions}
                loading={suggestionsLoading}
                onSendFriendRequest={sendFriendRequest}
                onScroll={handleSuggestionsScroll}
                listRef={suggestionsListRef}
                hasMore={hasMoreSuggestions}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityPage;

import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

// Ask user for permission and get FCM token
export const requestNotificationPermission = async () => {
  return Notification.requestPermission()
  .then((permission) => {
    if (permission === "granted" || permission === "default") {
      return getToken(messaging, {
        vapidKey: import.meta.env.VAPID_PUBLIC_KEY
      });
    }
  })
  .catch((err) => {console.error("Error in getting FCM token:",err); throw err;})
}

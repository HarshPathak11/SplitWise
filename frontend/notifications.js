import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

// Ask user for permission and get FCM token
export const requestNotificationPermission = async () => {
  return Notification.requestPermission()
  .then((permission) => {
    if (permission === "granted" || permission === "default") {
      return getToken(messaging, {
        vapidKey: "BJcK5VxVvregTfM4nPYNTg6s3GviBV0JeYFgbXaXoXrIadRMdvmxlwfwwK9LOsXqTgmmxqsiYp7nORzMJx5Mg0M"
      });
    }
  })
  .catch((err) => {console.error("Error in getting FCM token:",err); throw err;})
}

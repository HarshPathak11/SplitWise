// utils/subscribeUser.js

export async function subscribeUserToPush() {
  const sw = await navigator.serviceWorker.ready;

  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array('BOhlwelfOKl6vEZmFgl3pMTotYI9nBZginMTh2LN99rsI3zKIszWs7wGVrWPaZCpkKgJ2jeP8VriZnwlffziAns'),
  });
console.log('subscription', subscription);

  // Send to backend
  await fetch('http://localhost:8000/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

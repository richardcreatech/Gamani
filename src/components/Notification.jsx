import { useEffect, useState } from "react";
import { useNotification } from "../context/NotificationContext";

function Notification() {
  const { notification, hideNotification } = useNotification();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!notification) return undefined;

    setIsClosing(false);
    const closeTimeoutId = window.setTimeout(() => setIsClosing(true), 3700);
    const hideTimeoutId = window.setTimeout(hideNotification, 4000);

    return () => {
      window.clearTimeout(closeTimeoutId);
      window.clearTimeout(hideTimeoutId);
    };
  }, [notification, hideNotification]);

  if (!notification) return null;

  const dismiss = () => {
    setIsClosing(true);
    window.setTimeout(hideNotification, 300);
  };

  return (
    <div
      className={`notification notification--${notification.type}${
        isClosing ? " notification--closing" : ""
      }`}
      role="alert"
      aria-live="polite"
    >
      <span className="notification__icon" aria-hidden="true">
        {notification.type === "success"
          ? "✓"
          : notification.type === "error"
            ? "✕"
            : "i"}
      </span>
      <span>{notification.message}</span>
      <button
        className="notification__close"
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export default Notification;

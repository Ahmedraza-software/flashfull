import { notification } from "antd";
import type { LeavePeriodAlert } from "@/lib/types";

// Create a notification system for leave alerts
export const showLeaveAlertNotifications = (alerts: LeavePeriodAlert[]) => {
  if (alerts.length === 0) return;
  
  // Group alerts by employee to avoid duplicates
  const groupedAlerts = alerts.reduce((acc: Record<string, LeavePeriodAlert>, alert) => {
    const key = `${alert.employee_id}-${alert.to_date}`;
    if (!acc[key]) {
      acc[key] = alert;
    }
    return acc;
  }, {});

  // Show notifications for each unique alert
  Object.values(groupedAlerts).forEach((alert: LeavePeriodAlert) => {
    notification.warning({
      message: `Long Leave Alert`,
      description: `Employee ${alert.employee_id}\nLeave finished on ${alert.to_date}\n${alert.message}`,
      duration: 0, // Don't auto-close
      placement: 'topRight',
      key: `leave-${alert.employee_id}-${alert.to_date}`, // Unique key to prevent duplicates
    });
  });
};

// Clear all leave notifications
export const clearLeaveNotifications = () => {
  notification.destroy();
};

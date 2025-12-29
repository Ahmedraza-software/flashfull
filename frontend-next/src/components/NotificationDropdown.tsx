import React, { useState, useEffect } from 'react';
import { Badge, Button, Dropdown, List, Typography, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import type { LeavePeriodAlert } from '@/lib/types';

interface NotificationDropdownProps {
  alerts: LeavePeriodAlert[];
  onClear: () => void;
}

export default function NotificationDropdown({ alerts, onClear }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(alerts.length);
  }, [alerts]);

  const handleVisibleChange = (visible: boolean) => {
    setOpen(visible);
    if (visible) {
      setUnreadCount(0); // Mark as read when opened
    }
  };

  const notificationItems = alerts.map((alert, index) => ({
    key: index,
    label: (
      <div style={{ maxWidth: 300 }}>
        <List.Item style={{ padding: '8px 0', border: 'none' }}>
          <List.Item.Meta
            title={
              <Typography.Text strong style={{ fontSize: '12px' }}>
                Employee {alert.employee_id}
              </Typography.Text>
            }
            description={
              <div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  Leave ended: {alert.to_date}
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
                  {alert.message}
                </div>
              </div>
            }
          />
        </List.Item>
      </div>
    ),
  }));

  const menuItems = [
    {
      key: 'header',
      label: (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <Space>
            <Typography.Text strong>Leave Alerts</Typography.Text>
            <Typography.Text type="secondary">({alerts.length})</Typography.Text>
          </Space>
        </div>
      ),
      disabled: true,
    },
    ...notificationItems,
    {
      key: 'footer',
      label: (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
          <Button 
            size="small" 
            type="link" 
            onClick={onClear}
            style={{ width: '100%', textAlign: 'center' }}
          >
            Clear All
          </Button>
        </div>
      ),
      disabled: alerts.length === 0,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      open={open}
      onOpenChange={handleVisibleChange}
      placement="bottomRight"
      styles={{
        root: { maxHeight: 400, overflowY: 'auto' }
      }}
    >
      <Button 
        type="text" 
        icon={
          <Badge count={unreadCount} size="small" style={{ backgroundColor: '#faad14' }}>
            <BellOutlined style={{ fontSize: '16px', color: '#ffffff' }} />
          </Badge>
        }
        style={{ 
          border: 'none',
          boxShadow: 'none',
          padding: '4px 8px'
        }}
      />
    </Dropdown>
  );
}

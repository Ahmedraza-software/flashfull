"use client";

import {
  AppstoreOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Button, Col, DatePicker, Row, Space, Statistic, Typography, message } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return fallback;
}

type EmployeeListResponse = {
  employees: unknown[];
  total: number;
};

export default function DashboardHomePage() {
  const [msg, msgCtx] = message.useMessage();
  const { has } = useAuth();

  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

  const [counts, setCounts] = useState<{
    totalEmployees: number;
    totalClients: number;
    activeEmployees: number;
    employeesOnLeave: number;
    generalInventory: number;
    restrictedInventory: number;
    vehicles: number;
    advances: number;
    expenses: number;
    users: number;
  }>({ 
    totalEmployees: 0, 
    totalClients: 0, 
    activeEmployees: 0, 
    employeesOnLeave: 0,
    generalInventory: 0, 
    restrictedInventory: 0,
    vehicles: 0,
    advances: 0,
    expenses: 0,
    users: 0 
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const canClients = has("clients:view");
      const canFleet = has("fleet:view");
      const canInv = has("inventory:view");
      const canAccounts = has("accounts:full");
      const canAdmin = has("rbac:admin");

      // Only call existing API endpoints
      const [empList, clients, vehicles, generalItems, restrictedItems, expensesData] = await Promise.all([
        api.get<EmployeeListResponse>("/api/employees2", { query: { skip: 0, limit: 1, with_total: true } }),
        canClients ? api.get<unknown[]>("/api/client-management/clients") : Promise.resolve([]),
        canFleet ? api.get<unknown[]>("/api/vehicles/", { query: { limit: 5000 } }) : Promise.resolve([]),
        canInv ? api.get<unknown[]>("/api/general-inventory/items") : Promise.resolve([]),
        canInv ? api.get<unknown[]>("/api/restricted-inventory/items") : Promise.resolve([]),
        canAccounts ? api.get<any>("/api/expenses/summary/monthly", { query: { month } }) : Promise.resolve({ total_expenses: 0 }),
      ]);

      const employeesCount = Number(empList?.total ?? 0);
      const clientsCount = Array.isArray(clients) ? clients.length : 0;
      const vehiclesCount = Array.isArray(vehicles) ? vehicles.length : 0;
      const generalCount = Array.isArray(generalItems) ? generalItems.length : 0;
      const restrictedCount = Array.isArray(restrictedItems) ? restrictedItems.length : 0;
      const expensesTotal = Number(expensesData?.total_expenses ?? 0);

      // For demo purposes, assuming 5% on leave
      const onLeaveCount = Math.round(employeesCount * 0.05);

      setCounts({
        totalEmployees: employeesCount,
        totalClients: clientsCount,
        activeEmployees: 0, // Set to 0 as requested
        employeesOnLeave: onLeaveCount,
        generalInventory: generalCount,
        restrictedInventory: restrictedCount,
        vehicles: vehiclesCount,
        advances: 0, // Set to 0 until API exists
        expenses: expensesTotal,
        users: 7, // Hardcoded value until users API exists
      });
    } catch (e: unknown) {
      msg.error(errorMessage(e, "Failed to load dashboard"));
      setCounts({ 
        totalEmployees: 0, 
        totalClients: 0, 
        activeEmployees: 0, 
        employeesOnLeave: 0,
        generalInventory: 0, 
        restrictedInventory: 0,
        vehicles: 0,
        advances: 0,
        expenses: 0,
        users: 0 
      });
    } finally {
      setLoading(false);
    }
  }, [has, msg, month]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      {msgCtx}
      <Space orientation="vertical" size={20} style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
        {/* Header */}
        <Row gutter={[10, 10]} align="middle" style={{ width: "100%" }}>
          <Col xs={24} md={14} style={{ minWidth: 0 }}>
            <Space orientation="vertical" size={0} style={{ width: "100%" }}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Dashboard
              </Typography.Title>
              <Typography.Text type="secondary">Key operational indicators</Typography.Text>
            </Space>
          </Col>
          <Col xs={24} md={10}>
            <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
              <DatePicker
                picker="month"
                value={dayjs(month + "-01")}
                onChange={(d) => setMonth((d ?? dayjs()).format("YYYY-MM"))}
                style={{ width: "100%", maxWidth: 180 }}
              />
              <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading} />
            </Space>
          </Col>
        </Row>

        {/* KPI Cards with no background, just strokes */}
        <Row gutter={[16, 16]} style={{ width: "100%" }}>
          {/* Total Clients */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><UserOutlined />Total Clients</Space>}
                value={counts.totalClients}
                styles={{ content: { color: "#1890ff", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>

          {/* Total Employees */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><TeamOutlined />Total Employees</Space>}
                value={counts.totalEmployees}
                styles={{ content: { color: "#52c41a", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>

          {/* Employees on Leave */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><TeamOutlined />On Leave</Space>}
                value={counts.employeesOnLeave}
                styles={{ content: { color: "#faad14", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>

          {/* General Inventory */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><AppstoreOutlined />General Inventory</Space>}
                value={counts.generalInventory}
                styles={{ content: { color: "#722ed1", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>

          {/* Restricted Inventory */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><SafetyCertificateOutlined />Restricted Inventory</Space>}
                value={counts.restrictedInventory}
                styles={{ content: { color: "#f5222d", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>

          {/* Vehicles */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><CarOutlined />Vehicles</Space>}
                value={counts.vehicles}
                styles={{ content: { color: "#fa8c16", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>

          {/* Advances */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><DollarOutlined />Advances</Space>}
                value={counts.advances}
                styles={{ content: { color: "#eb2f96", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>

          {/* Expenses */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><WalletOutlined />Expenses</Space>}
                value={counts.expenses}
                styles={{ content: { color: "#a0d911", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>

          {/* Users */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "8px", 
              padding: "16px",
              background: "transparent",
              transition: "all 0.3s",
              cursor: "default"
            }}>
              <Statistic
                title={<Space size={4}><TeamOutlined />Users</Space>}
                value={counts.users}
                styles={{ content: { color: "#2f54eb", fontSize: "24px", fontWeight: 600 } }}
              />
            </div>
          </Col>
        </Row>
      </Space>
    </>
  );
}

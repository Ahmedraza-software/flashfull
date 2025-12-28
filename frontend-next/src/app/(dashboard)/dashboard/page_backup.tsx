"use client";

import {
  AppstoreOutlined,
  CarOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Column, Line } from "@ant-design/plots";
import { Button, Card, Col, DatePicker, Dropdown, Row, Space, Statistic, Typography, message } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { formatRs } from "@/lib/money";
import { useAuth } from "@/lib/auth";

function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return fallback;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type PayrollReportResponse = {
  summary?: { total_net?: number; total_gross?: number; employees?: number };
  rows: Array<{ employee_id: string; paid_status?: string; net_pay?: number }>;
};

function payrollPeriodForMonth(month: string): { from: string; to: string } {
  const to = dayjs(month + "-01").date(25);
  const from = to.subtract(1, "month").date(26);
  return { from: from.format("YYYY-MM-DD"), to: to.format("YYYY-MM-DD") };
}

type ClientSummaryResponse = {
  month: string;
  total_cleared?: number;
  total_pending?: number;
  trend?: Array<{ month: string; value: number }>;
};

type AssignmentEfficiencyResponse = {
  total_km?: number;
  total_amount?: number;
  vehicles?: Array<{ vehicle_id: string; total_km?: number }>;
};

type EmployeeListResponse = {
  employees: unknown[];
  total: number;
};

type AnalyticsData = {
  period: { from_date: string; to_date: string; month: string };
  employees: {
    total: number;
    active: number;
    new_this_month: number;
  };
  payroll: {
    total_gross: number;
    total_net: number;
    total_salary: number;
    total_overtime: number;
    total_deductions: number;
    avg_salary: number;
  };
  attendance: {
    total_records: number;
    present: number;
    late: number;
    absent: number;
    leave: number;
    attendance_rate: number;
    punctuality_rate: number;
  };
  top_earners: Array<{ name: string; net_pay: number }>;
  top_overtime: Array<{ name: string; overtime_pay: number; overtime_hours: number }>;
  department_breakdown: Array<{ department: string; count: number; total_salary: number }>;
  monthly_trend: Array<{ month: string; gross: number; net: number; employees: number }>;
};

export default function DashboardHomePage() {
  const [msg, msgCtx] = message.useMessage();
  const { has } = useAuth();

  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

  const [clearedSummary, setClearedSummary] = useState<ClientSummaryResponse | null>(null);
  const [pendingSummary, setPendingSummary] = useState<ClientSummaryResponse | null>(null);
  const [payrollReport, setPayrollReport] = useState<PayrollReportResponse | null>(null);
  const [assignmentMonthSummary, setAssignmentMonthSummary] = useState<AssignmentEfficiencyResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [counts, setCounts] = useState<{
    employees: number;
    vehicles: number;
    clients: number;
    guns: number;
    inventoryTotal: number;
  }>({ employees: 0, vehicles: 0, clients: 0, guns: 0, inventoryTotal: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const period = payrollPeriodForMonth(month);
      const canClients = has("clients:view");
      const canPayroll = has("payroll:view");
      const canFleet = has("fleet:view");
      const canInv = has("inventory:view");
      const canPerformance = has("performance:view");

      const [cleared, pending, payroll, assignEff, empList, vehicles, clients, generalItems, restrictedItems, analyticsRes] = await Promise.all([
        canClients
          ? api.get<ClientSummaryResponse>("/api/client-management/invoices/cleared-summary", { query: { month, months: 6 } })
          : Promise.resolve(null),
        canClients
          ? api.get<ClientSummaryResponse>("/api/client-management/invoices/pending-summary", { query: { month, months: 6 } })
          : Promise.resolve(null),
        canPayroll
          ? api.get<PayrollReportResponse>("/api/payroll/range-report", { query: { month, from_date: period.from, to_date: period.to } })
          : Promise.resolve(null),
        canFleet
          ? api.get<AssignmentEfficiencyResponse>("/api/vehicle-assignments/efficiency", { query: { period: "month", month } })
          : Promise.resolve(null),
        api.get<EmployeeListResponse>("/api/employees/", { query: { skip: 0, limit: 1, with_total: true } }),
        canFleet ? api.get<unknown[]>("/api/vehicles/", { query: { limit: 5000 } }) : Promise.resolve([]),
        canClients ? api.get<unknown[]>("/api/client-management/clients") : Promise.resolve([]),
        canInv ? api.get<unknown[]>("/api/general-inventory/items") : Promise.resolve([]),
        canInv ? api.get<unknown[]>("/api/restricted-inventory/items") : Promise.resolve([]),
        canPerformance
          ? api.get<AnalyticsData>("/api/analytics/dashboard", {
              query: { from_date: period.from, to_date: period.to },
            })
          : Promise.resolve(null),
      ]);

      setClearedSummary(cleared ?? null);
      setPendingSummary(pending ?? null);
      setPayrollReport(payroll ?? null);
      setAssignmentMonthSummary(assignEff ?? null);
      setAnalytics(analyticsRes ?? null);

      const vehiclesCount = Array.isArray(vehicles) ? vehicles.length : 0;
      const clientsCount = Array.isArray(clients) ? clients.length : 0;
      const generalCount = Array.isArray(generalItems) ? generalItems.length : 0;
      const gunsCount = Array.isArray(restrictedItems) ? restrictedItems.length : 0;

      setCounts({
        employees: Number(empList?.total ?? 0),
        vehicles: vehiclesCount,
        clients: clientsCount,
        guns: gunsCount,
        inventoryTotal: generalCount + gunsCount,
      });
    } catch (e: unknown) {
      msg.error(errorMessage(e, "Failed to load dashboard"));
      setClearedSummary(null);
      setPendingSummary(null);
      setPayrollReport(null);
      setAssignmentMonthSummary(null);
      setAnalytics(null);
      setCounts({ employees: 0, vehicles: 0, clients: 0, guns: 0, inventoryTotal: 0 });
    } finally {
      setLoading(false);
    }
  }, [has, month, msg]);

  useEffect(() => {
    void load();
  }, [load]);

  const kpis = useMemo(() => {
    const payrollRows = payrollReport?.rows ?? [];

    const payrollTotalNet = Number(payrollReport?.summary?.total_net ?? 0);

    const payrollPaid = payrollRows.reduce((a, r) => {
      const st = String(r.paid_status ?? "unpaid").toLowerCase();
      if (st !== "paid") return a;
      return a + Number(r.net_pay ?? 0);
    }, 0);

    const payrollDue = payrollRows.reduce((a, r) => {
      const st = String(r.paid_status ?? "unpaid").toLowerCase();
      if (st === "paid") return a;
      return a + Number(r.net_pay ?? 0);
    }, 0);

    return {
      receivablesPending: Number(pendingSummary?.total_pending ?? 0),
      receivablesCleared: Number(clearedSummary?.total_cleared ?? 0),
      payrollTotalNet,
      payrollPaid,
      payrollDue,
      kmCovered: Number(assignmentMonthSummary?.total_km ?? 0),
      assignmentCost: Number(assignmentMonthSummary?.total_amount ?? 0),
    };
  }, [assignmentMonthSummary?.total_amount, assignmentMonthSummary?.total_km, clearedSummary?.total_cleared, payrollReport?.rows, payrollReport?.summary?.total_net, pendingSummary?.total_pending]);

  const receivablesTrend = useMemo(() => {
    const byMonth = new Map<string, { month: string; pending: number; cleared: number }>();

    for (const r of pendingSummary?.trend ?? []) {
      byMonth.set(r.month, { month: r.month, pending: Number(r.value ?? 0), cleared: 0 });
    }
    for (const r of clearedSummary?.trend ?? []) {
      const existing = byMonth.get(r.month);
      if (existing) existing.cleared = Number(r.value ?? 0);
      else byMonth.set(r.month, { month: r.month, pending: 0, cleared: Number(r.value ?? 0) });
    }

    return Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [clearedSummary?.trend, pendingSummary?.trend]);

  const receivablesTrendLong = useMemo(() => {
    const rows: Array<{ month: string; metric: "Pending" | "Cleared"; value: number }> = [];
    for (const r of receivablesTrend) {
      rows.push({ month: r.month, metric: "Pending", value: Number(r.pending || 0) });
      rows.push({ month: r.month, metric: "Cleared", value: Number(r.cleared || 0) });
    }
    return rows;
  }, [receivablesTrend]);

  const receivablesTrendConfig = useMemo(
    () => ({
      data: receivablesTrendLong,
      xField: "month",
      yField: "value",
      seriesField: "metric",
      height: 240,
      autoFit: true,
      smooth: true,
      color: ["#1677ff", "#52c41a"],
      legend: { position: "top" as const },
      point: { size: 3, shape: "circle" },
      xAxis: {
        tickLine: null,
        label: { formatter: (v: string) => dayjs(v + "-01").format("MMM") },
        line: null,
        grid: null,
      },
      yAxis: {
        label: { formatter: (v: string) => formatRs(Number(v || 0), 0) },
        grid: null,
        line: null,
      },
      tooltip: {
        formatter: (d: { metric: string; value: number }) => ({ name: d.metric, value: formatRs(Number(d.value || 0), 2) }),
      },
    }),
    [receivablesTrendLong]
  );

  const payrollPaidVsDueData = useMemo(
    () => [
      { type: "Paid", value: Number(kpis.payrollPaid || 0) },
      { type: "Due", value: Number(kpis.payrollDue || 0) },
    ],
    [kpis.payrollDue, kpis.payrollPaid]
  );

  const payrollPaidVsDueConfig = useMemo(
    () => ({
      data: payrollPaidVsDueData,
      xField: "type",
      yField: "value",
      height: 240,
      autoFit: true,
      columnWidthRatio: 0.45,
      color: ({ type }: { type: string }) => (type === "Paid" ? "#52c41a" : "#ff4d4f"),
      xAxis: { tickLine: null, line: null },
      yAxis: {
        label: { formatter: (v: string) => formatRs(Number(v || 0), 0) },
        grid: null,
        line: null,
      },
      label: {
        position: "middle" as const,
        style: { fill: "#fff", fontWeight: 600 },
        formatter: (d: { value: number }) => (d.value ? formatRs(Number(d.value || 0), 0) : ""),
      },
      tooltip: {
        formatter: (d: { type: string; value: number }) => ({ name: d.type, value: formatRs(Number(d.value || 0), 2) }),
      },
    }),
    [payrollPaidVsDueData]
  );

  const exportAccountsMonthPdf = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/api/exports/accounts/monthly/pdf?month=${encodeURIComponent(month)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      downloadBlob(blob, `accounts_export_${month}.pdf`);
    } catch (e: unknown) {
      msg.error(errorMessage(e, "Export failed"));
    }
  }, [month, msg]);

  const exportPayrollPdf = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/api/payroll/export/pdf?month=${encodeURIComponent(month)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      downloadBlob(blob, `payroll_${month}.pdf`);
    } catch (e: unknown) {
      msg.error(errorMessage(e, "Export failed"));
    }
  }, [month, msg]);

  const header = useMemo(
    () => (
      <Row gutter={[10, 10]} align="middle" style={{ width: "100%" }}>
        <Col xs={24} md={14} style={{ minWidth: 0 }}>
          <Space direction="vertical" size={0} style={{ width: "100%" }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Dashboard
            </Typography.Title>
            <Typography.Text type="secondary">Key operational and financial indicators for the selected month</Typography.Text>
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
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  { key: "accounts_pdf", label: "Export Accounts (Month) PDF", onClick: () => void exportAccountsMonthPdf() },
                  { key: "payroll_pdf", label: "Export Payroll (Month) PDF", onClick: () => void exportPayrollPdf() },
                ],
              }}
            >
              <Button icon={<DownloadOutlined />} />
            </Dropdown>
          </Space>
        </Col>
      </Row>
    ),
    [exportAccountsMonthPdf, exportPayrollPdf, load, loading, month]
  );

  return (
    <>
      {msgCtx}
      <Space direction="vertical" size={10} style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
        {header}

        <Card
          size="small"
          className="flash-card"
          loading={loading}
          styles={{ body: { padding: 12 } }}
          title={<Typography.Text strong>System Overview</Typography.Text>}
        >
          <Row gutter={[10, 10]} style={{ width: "100%" }}>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><TeamOutlined />Employees</Space>} value={counts.employees} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><CarOutlined />Vehicles</Space>} value={counts.vehicles} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><UserOutlined />Clients</Space>} value={counts.clients} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><AppstoreOutlined />Inventory</Space>} value={counts.inventoryTotal} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><SafetyCertificateOutlined />Guns</Space>} value={counts.guns} />
            </Col>

            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><WalletOutlined />Client Due</Space>} value={kpis.receivablesPending} prefix="Rs" precision={2} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><CheckCircleOutlined />Client Paid</Space>} value={kpis.receivablesCleared} prefix="Rs" precision={2} />
            </Col>

            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><WalletOutlined />Payroll Due</Space>} value={kpis.payrollDue} prefix="Rs" precision={2} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><WalletOutlined />Payroll Total Net</Space>} value={kpis.payrollTotalNet} prefix="Rs" precision={2} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><CheckCircleOutlined />Payroll Paid</Space>} value={kpis.payrollPaid} prefix="Rs" precision={2} />
            </Col>

            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><CarOutlined />KM Covered</Space>} value={kpis.kmCovered} precision={2} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic title={<Space size={6}><WalletOutlined />Assign Cost</Space>} value={kpis.assignmentCost} prefix="Rs" precision={2} />
            </Col>
            <Col xs={12} md={6} xl={4}>
              <Statistic
                title="Cost per KM"
                value={kpis.kmCovered > 0 ? kpis.assignmentCost / kpis.kmCovered : 0}
                prefix="Rs"
                precision={2}
              />
            </Col>
          </Row>
        </Card>

        <Row gutter={[10, 10]} style={{ width: "100%" }}>
          <Col xs={24} lg={12}>
            <Card
              size="small"
              className="flash-card"
              loading={loading}
              title="Workforce & Attendance"
              styles={{ body: { padding: 12 } }}
            >
              {analytics ? (
                <Row gutter={[10, 10]}>
                  <Col xs={12} md={8}>
                    <Statistic title="Employees (Active)" value={Number(analytics.employees.active || 0)} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="New This Month" value={Number(analytics.employees.new_this_month || 0)} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Attendance Rate" value={Number(analytics.attendance.attendance_rate || 0)} suffix="%" precision={1} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Punctuality" value={Number(analytics.attendance.punctuality_rate || 0)} suffix="%" precision={1} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Present" value={Number(analytics.attendance.present || 0)} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Late" value={Number(analytics.attendance.late || 0)} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Absent" value={Number(analytics.attendance.absent || 0)} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Leave" value={Number(analytics.attendance.leave || 0)} />
                  </Col>
                </Row>
              ) : (
                <Typography.Text type="secondary">No workforce analytics available</Typography.Text>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              size="small"
              className="flash-card"
              loading={loading}
              title="Payroll Breakdown"
              styles={{ body: { padding: 12 } }}
            >
              {analytics ? (
                <Row gutter={[10, 10]}>
                  <Col xs={12} md={8}>
                    <Statistic title="Total Gross" value={Number(analytics.payroll.total_gross || 0)} prefix="Rs" precision={2} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Total Net" value={Number(analytics.payroll.total_net || 0)} prefix="Rs" precision={2} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Avg Salary" value={Number(analytics.payroll.avg_salary || 0)} prefix="Rs" precision={2} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Salary" value={Number(analytics.payroll.total_salary || 0)} prefix="Rs" precision={2} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Overtime" value={Number(analytics.payroll.total_overtime || 0)} prefix="Rs" precision={2} />
                  </Col>
                  <Col xs={12} md={8}>
                    <Statistic title="Deductions" value={Number(analytics.payroll.total_deductions || 0)} prefix="Rs" precision={2} />
                  </Col>
                </Row>
              ) : (
                <Typography.Text type="secondary">No payroll analytics available</Typography.Text>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[10, 10]} style={{ width: "100%" }}>
          <Col xs={24} lg={14}>
            <Card
              size="small"
              className="flash-card"
              loading={loading}
              style={{ width: "100%" }}
              title="Receivables Pending vs Cleared (Trend)"
              extra={
                <Space size={12}>
                  <Typography.Text type="secondary">Pending</Typography.Text>
                  <Typography.Text strong>{formatRs(kpis.receivablesPending, 2)}</Typography.Text>
                </Space>
              }
              styles={{ body: { paddingTop: 0 } }}
            >
              {receivablesTrendLong.length === 0 ? (
                <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography.Text type="secondary">No receivables trend data for this period</Typography.Text>
                </div>
              ) : (
                <Line {...receivablesTrendConfig} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              size="small"
              className="flash-card"
              loading={loading}
              style={{ width: "100%" }}
              title="Payroll (Paid vs Due)"
              extra={<Typography.Text strong>{formatRs(kpis.payrollTotalNet, 2)}</Typography.Text>}
              styles={{ body: { paddingTop: 0 } }}
            >
              {payrollPaidVsDueData.every((r) => Number(r.value || 0) === 0) ? (
                <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography.Text type="secondary">No payroll data for this period</Typography.Text>
                </div>
              ) : (
                <Column {...payrollPaidVsDueConfig} />
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </>
  );
}

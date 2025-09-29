"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import EmployeeManagement from "../../../components/EmployeeManagement";

export default function DashboardEmployees() {
  return (
    <DashboardLayout>
      <EmployeeManagement />
    </DashboardLayout>
  );
}

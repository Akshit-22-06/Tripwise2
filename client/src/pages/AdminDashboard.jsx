import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Download, Users, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("users");

  const fetchAdminData = async () => {
    try {
      const reportRes = await adminAPI.getReports();
      setReport(reportRes.data.data);

      const usersRes = await adminAPI.getUsers();
      setUsersList(usersRes.data.data || []);

      const verifRes = await adminAPI.getVerifications();
      setPendingVerifications(verifRes.data.data || []);
    } catch (err) {
      console.error("Failed to load administrative data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await adminAPI.toggleStatus(userId);
      await fetchAdminData();
    } catch (err) {
      alert("Could not update user status.");
    }
  };

  const handleProcessVerification = async (verificationId, status) => {
    const notes =
      status === "APPROVED"
        ? "Approved credentials."
        : "Declined business credentials.";
    try {
      await adminAPI.processVerification({
        verificationId,
        status,
        notes,
      });
      await fetchAdminData();
    } catch (err) {
      alert("Failed to update verification status.");
    }
  };

  const handleCompileReport = () => {
    if (!report) return;
    const reportTxt = JSON.stringify(report, null, 2);
    const blob = new Blob([reportTxt], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `platform_report_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        <div className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p>Loading admin portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platform metrics, user account access control, and merchant credential reviews.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCompileReport}
          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Export JSON
          Audit
        </button>
      </div>

      {/* Metrics Summary */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <span className="text-xs text-slate-500 font-medium block">
              Total Users
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {report.platformMetrics?.totalUsers}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <span className="text-xs text-slate-500 font-medium block">
              Merchants
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {report.platformMetrics?.merchantsCount}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <span className="text-xs text-slate-500 font-medium block">
              Bookings Processed
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {report.platformMetrics?.totalTransactionsCount}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <span className="text-xs text-slate-500 font-medium block">
              Platform Gross Revenue
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {report.platformMetrics?.totalPlatformRevenue?.toLocaleString()}{" "}
              INR
            </span>
          </div>
        </div>
      )}

      {/* Sub Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-md p-1.5 space-y-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSubTab("users")}
            className={`w-full text-left px-3 py-2 rounded transition flex justify-between items-center ${
              activeSubTab === "users"
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-3.5 w-3.5" />
              <span>User Accounts</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                activeSubTab === "users"
                  ? "bg-slate-800 text-slate-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {usersList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("verifications")}
            className={`w-full text-left px-3 py-2 rounded transition flex justify-between items-center ${
              activeSubTab === "verifications"
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verifications Queue</span>
            </div>
            {pendingVerifications.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {pendingVerifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Column */}
        <div className="lg:col-span-9 space-y-3">
          {/* Subtab 1: Users */}
          {activeSubTab === "users" && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                User Accounts Directory
              </h2>
              <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                    <tr>
                      <th className="py-2.5 px-3.5">Name</th>
                      <th className="py-2.5 px-3.5">Email</th>
                      <th className="py-2.5 px-3.5">Role</th>
                      <th className="py-2.5 px-3.5">Account Status</th>
                      <th className="py-2.5 px-3.5 text-right">Access Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {usersList.map((usr) => (
                      <tr key={usr._id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          {usr.name}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px]">
                          {usr.email}
                        </td>
                        <td className="py-2.5 px-3.5 capitalize">
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 rounded text-slate-700">
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          {usr.is_verified ? (
                            <span className="text-emerald-700 font-medium text-[11px]">
                              Active
                            </span>
                          ) : (
                            <span className="text-rose-700 font-medium text-[11px]">
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          {usr.role !== "admin" && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(usr._id)}
                              className={`px-2 py-0.5 text-[11px] font-medium rounded border transition ${
                                usr.is_verified
                                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              }`}
                            >
                              {usr.is_verified ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 2: Verifications Queue */}
          {activeSubTab === "verifications" && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Pending Merchant Applications ({pendingVerifications.length})
              </h2>

              {pendingVerifications.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-xs text-slate-400">
                  No merchant applications awaiting administrative verification.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                      <tr>
                        <th className="py-2.5 px-3.5">Applicant / Owner</th>
                        <th className="py-2.5 px-3.5">Contact Particulars</th>
                        <th className="py-2.5 px-3.5">Business Reg #</th>
                        <th className="py-2.5 px-3.5">Review Status</th>
                        <th className="py-2.5 px-3.5 text-right">Review Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {pendingVerifications.map((ver) => (
                        <tr key={ver._id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3.5 font-medium text-slate-900">
                            {ver.ownerId?.name || "Applicant"}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600">
                            <div>{ver.ownerId?.email}</div>
                            <div className="text-[10px] text-slate-400">
                              {ver.ownerId?.phone || "No phone provided"}
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-800">
                            {ver.businessRegNumber}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded">
                              Pending Review
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            <div className="inline-flex space-x-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleProcessVerification(ver._id, "REJECTED")
                                }
                                className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleProcessVerification(ver._id, "APPROVED")
                                }
                                className="px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
                              >
                                Approve
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

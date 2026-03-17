import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faHourglassEnd,
  faTimesCircle,
  faPhone,
  faEnvelope,
  faHospital,
} from "@fortawesome/free-solid-svg-icons";

function AppointmentPage() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const cookies = new Cookies();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, accepted, rejected

  useEffect(() => {
    fetch(`${apiUrl}/auth-endpoint`, {
      method: "GET",
      headers: { Authorization: `Bearer ${cookies.get("auth")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error || data.userType !== "patient") navigate("/");
      })
      .catch((error) => console.log(error.message));
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/appointments/patient`, {
          headers: { Authorization: `Bearer ${cookies.get("auth")}` },
        });
        const data = await response.json();
        if (!data.error && Array.isArray(data)) {
          setAppointments(data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getFilteredAppointments = () => {
    if (filterStatus === "all") return appointments;
    return appointments.filter((appt) => appt.status === filterStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return faCalendarCheck;
      case "Rejected":
        return faTimesCircle;
      case "Pending":
        return faHourglassEnd;
      default:
        return faHourglassEnd;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Accepted":
        return "Đã Chấp Nhận";
      case "Rejected":
        return "Bị Từ Chối";
      case "Pending":
        return "Đang Chờ";
      default:
        return status;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="flex h-screen">
      <div className="w-2/12 bg-gray-200">
        <Navbar />
      </div>
      <div className="w-10/12 bg-white p-8 overflow-y-auto">
        <div className="bg-gray-100 rounded-lg shadow-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Lịch Hẹn Khám
            </h1>
            <p className="text-gray-600">
              Xem trạng thái các lịch hẹn khám của bạn
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="px-6 py-4 border-b border-gray-200 flex gap-3 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Tất Cả ({appointments.length})
            </button>
            <button
              onClick={() => setFilterStatus("Pending")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === "Pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Đang Chờ (
              {appointments.filter((a) => a.status === "Pending").length})
            </button>
            <button
              onClick={() => setFilterStatus("Accepted")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === "Accepted"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Chấp Nhận (
              {appointments.filter((a) => a.status === "Accepted").length})
            </button>
            <button
              onClick={() => setFilterStatus("Rejected")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === "Rejected"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Từ Chối (
              {appointments.filter((a) => a.status === "Rejected").length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {filterStatus === "all"
                    ? "Bạn chưa có lịch hẹn nào"
                    : `Bạn không có lịch hẹn ${getStatusText(
                        filterStatus,
                      ).toLowerCase()}`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      {/* Bác sĩ Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {appointment.doctorInfo?.name || "Bác sĩ"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.doctorInfo?.department ||
                            "Chuyên khoa không xác định"}
                        </p>
                        {appointment.doctorInfo?.hospital && (
                          <p className="text-sm text-gray-500">
                            <FontAwesomeIcon
                              icon={faHospital}
                              className="mr-2"
                            />
                            {appointment.doctorInfo.hospital}
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(
                          appointment.status,
                        )}`}
                      >
                        <FontAwesomeIcon
                          icon={getStatusIcon(appointment.status)}
                        />
                        {getStatusText(appointment.status)}
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Ngày Khám</p>
                        <p className="text-gray-800">{appointment.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Giờ Khám</p>
                        <p className="text-gray-800">{appointment.time}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-600 font-medium">Lý Do Khám</p>
                        <p className="text-gray-800">{appointment.reason}</p>
                      </div>
                    </div>

                    {/* Doctor Contact */}
                    {appointment.doctorInfo && (
                      <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-4 text-sm">
                        {appointment.doctorInfo.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="text-blue-500"
                            />
                            {appointment.doctorInfo.email}
                          </div>
                        )}
                        {appointment.status === "Accepted" && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-medium">
                              ✓ Lịch hẹn đã được xác nhận
                            </span>
                          </div>
                        )}
                        {appointment.status === "Rejected" && (
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 font-medium">
                              ✗ Lịch hẹn bị từ chối
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Created Time */}
                    <p className="text-xs text-gray-400 mt-3">
                      Đặt lịch vào:{" "}
                      {new Date(appointment.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentPage;

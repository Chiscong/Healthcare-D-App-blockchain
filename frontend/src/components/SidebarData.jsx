import React from "react";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";

export const SidebarData = [
  {
    title: "Bảng điều khiển",
    path: "/",
    cName: "nav-text",
    userType: "patient",
    icon: <FaIcons.FaClinicMedical />,
  },
  {
    title: "Lịch Hẹn",
    path: "/appointments",
    cName: "nav-text",
    userType: "patient",
    icon: <FaIcons.FaCalendarAlt />,
  },
  {
    title: "Bác Sĩ",
    path: "/patient",
    cName: "nav-text",
    userType: "patient",
    icon: <Fa6Icons.FaUserDoctor />,
  },
  {
    title: "Thuốc",
    cName: "nav-text",
    userType: "patient",
    icon: <MdIcons.MdMedicationLiquid />,
  },
  {
    title: "Hồ Sơ",
    cName: "nav-text",
    userType: "doctor",
    icon: <MdIcons.MdPerson />,
  },
  {
    title: "Lịch Hẹn",
    path: "/doctor",
    cName: "nav-text",
    userType: "doctor",
    icon: <FaIcons.FaCalendarAlt />,
  },
  {
    title: "Bệnh Nhân",
    cName: "nav-text",
    userType: "doctor",
    icon: <MdIcons.MdPeople />,
  },
  {
    title: "Đơn Thuốc",
    cName: "nav-text",
    userType: "doctor",
    icon: <MdIcons.MdMedicationLiquid />,
  },
  {
    title: "Trò Chuyện",
    cName: "nav-text",
    userType: "both",
    icon: <MdIcons.MdChat />,
  },
  {
    title: "Cài Đặt",
    cName: "nav-text",
    userType: "both",
    icon: <MdIcons.MdSettings />,
  },
];

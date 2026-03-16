import React from "react";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";

export const SidebarData = [
  {
    title: "Bảng điều khiển",
    cName: "nav-text",
    userType: "patient",
    icon: <FaIcons.FaClinicMedical />,
  },
  {
    title: "Đặt lịch",
    cName: "nav-text",
    userType: "patient",
    icon: <FaIcons.FaCalendarAlt />,
  },
  {
    title: "Bác sĩ",
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
    title: "Hồ sơ",
    cName: "nav-text",
    userType: "doctor",
    icon: <MdIcons.MdPerson />,
  },
  {
    title: "Lịch hẹn",
    cName: "nav-text",
    userType: "doctor",
    icon: <FaIcons.FaCalendarAlt />,
  },
  {
    title: "Bệnh nhân",
    cName: "nav-text",
    userType: "doctor",
    icon: <MdIcons.MdPeople />,
  },
  {
    title: "Đơn thuốc",
    cName: "nav-text",
    userType: "doctor",
    icon: <MdIcons.MdMedicationLiquid />,
  },
  {
    title: "Trò chuyện",
    cName: "nav-text",
    userType: "both",
    icon: <MdIcons.MdChat />,
  },
  {
    title: "Cài đặt",
    cName: "nav-text",
    userType: "both",
    icon: <MdIcons.MdSettings />,
  },
  //   {
  //     title: "Logout",
  //     cName: "nav-text",
  //     userType: "both",
  //     icon: <MdIcons.MdLogout />,
  //   },
];

import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import CustomModal from "./CustomModal"; // Import the custom modal component

function Navbar(props) {
  const [sidebar] = useState(true);
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [userType, setUserType] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    // Lấy userType từ API
    const fetchUserType = async () => {
      try {
        const token = cookies.get("auth");
        if (!token) {
          console.warn("No auth token found");
          return;
        }

        const response = await fetch(`${apiUrl}/auth-endpoint`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error(
            "Auth endpoint returned status:",
            response.status,
            response.statusText,
          );
          return;
        }

        const data = await response.json();
        if (data.userType) {
          setUserType(data.userType);
        } else if (data.error) {
          console.error("Auth error from server:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    };

    fetchUserType();
  }, [apiUrl]);

  const handleLogout = () => {
    // Remove the JWT token from the cookie
    cookies.remove("auth");
    // Redirect the user to the home page
    navigate("/");
  };

  const handleItemClick = (message) => {
    // Set the message for the modal
    setModalMessage("Các trang khác vẫn đang được phát triển.");
    // Show the modal
    setShowModal(true);
  };

  // Filter sidebar items based on userType
  const filteredSidebarData = userType
    ? SidebarData.filter((item) => {
        if (item.userType === "both") return true; // Always show "both" items
        return item.userType === userType; // Show only items matching userType
      })
    : []; // Show empty if userType still loading

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-gray-800">
        <div className="flex justify-between">
          <Link to="#" className="text-white p-4">
            <FaIcons.FaBars />
          </Link>
        </div>
      </nav>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col">
            <nav className="flex-1 bg-gray-200">
              <ul className="flex flex-col">
                {filteredSidebarData.map((item, index) => {
                  return (
                    <li
                      key={index}
                      onClick={() => handleItemClick(item.message)}
                    >
                      {" "}
                      {/* Pass message to handleItemClick */}
                      <Link
                        to={item.path}
                        className="flex items-center p-4 hover:bg-gray-300"
                      >
                        {item.icon}
                        <span className="mx-4">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
                <li onClick={handleLogout}>
                  <Link
                    to="#"
                    className="flex items-center p-4 hover:bg-gray-300"
                  >
                    <FaIcons.FaSignOutAlt />
                    <span className="mx-4">Đăng xuất</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      {/* Render the modal if showModal is true */}
      {showModal && (
        <CustomModal
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default Navbar;

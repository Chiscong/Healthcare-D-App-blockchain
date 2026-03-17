import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faTimes,
  faCheck,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { MedicalAppContractAddress } from "../../config";
import MedicalAppAbi from "../../MedicalApp.json";
import Navbar from "../../components/Navbar";
import MetaMask from "../../assets/images/metamask.svg";
const ethers = require("ethers");

function DoctorPage() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const cookies = new Cookies();
  const navigate = useNavigate();

  const [MedicalRecords, setMedicalRecords] = useState();
  const [patientWalletAddress, setPatientWalletAddress] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newInfo, setNewInfo] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");

  // State quản lý lịch hẹn
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const insertWords = async () => {
      const words = [
        "Để xem hồ sơ y tế của bệnh nhân, hãy nhập địa chỉ ví MetaMask của bệnh nhân và nhấp vào tìm kiếm.",
        "Lưu ý: Bạn chỉ có thể xem hồ sơ y tế của các bệnh nhân đã cấp quyền cho bạn.",
        "Tải hồ sơ y tế lên blockchain yêu cầu phí gas.",
      ];
      for (let i = 0; i < words.length; i++) {
        const instructionChar =
          document.querySelectorAll(".instruction-char")[i];
        if (instructionChar && isMounted) {
          instructionChar.textContent = "";
          for (let j = 0; j < words[i].length; j++) {
            instructionChar.textContent += words[i][j];
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    };
    insertWords();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setCurrentAccount("");
        alert("Bạn đã ngắt kết nối ví MetaMask của mình");
      } else {
        setCurrentAccount(accounts[0]);
      }
    };

    const connectAndCheckNetwork = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) return;
        ethereum.on("accountsChanged", handleAccountsChanged);
        let chainId = await ethereum.request({ method: "eth_chainId" });
        if (chainId !== "0xaa36a7") {
          alert("Vui lòng kết nối với mạng kiểm tra Sepolia");
          return;
        }
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.log(error);
      }
    };
    connectAndCheckNetwork();
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(`${apiUrl}/auth-endpoint`, {
          method: "GET",
          headers: { Authorization: `Bearer ${cookies.get("auth")}` },
        });

        if (!response.ok) {
          console.error("Auth endpoint returned:", response.status);
          navigate("/");
          return;
        }

        const data = await response.json();
        if (data.error) {
          console.error("Auth error:", data.error);
          navigate("/");
        } else if (data.userType !== "doctor") {
          console.error(
            "User type mismatch. Expected doctor, got:",
            data.userType,
          );
          navigate("/");
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        navigate("/");
      }
    };

    verifyAuth();
  }, [navigate]);

  // Lấy danh sách lịch hẹn khi Bác sĩ đăng nhập
  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${apiUrl}/appointments/doctor`, {
        headers: { Authorization: `Bearer ${cookies.get("auth")}` },
      });
      const data = await response.json();
      if (!data.error) setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []); // Chạy 1 lần khi load trang

  // Hàm xử lý Cập nhật trạng thái lịch hẹn
  const handleUpdateApptStatus = async (id, status) => {
    try {
      const response = await fetch(`${apiUrl}/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("auth")}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        const statusVN = status === "Accepted" ? "Đã Chấp Nhận" : "Bị Từ Chối";
        alert(`Lịch hẹn ${statusVN}!`);
        fetchAppointments(); // Gọi lại để cập nhật bảng
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (patientWalletAddress === "") {
      alert("Vui lòng nhập địa chỉ ví của bệnh nhân");
      return;
    }
    const cleanAddress = patientWalletAddress.trim();
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const MedicalContract = new ethers.Contract(
          MedicalAppContractAddress,
          MedicalAppAbi.abi,
          signer,
        );
        MedicalContract.getMedical(cleanAddress)
          .then((res) => {
            if (res[1] === false) {
              alert("Bạn không được phép xem hồ sơ y tế của bệnh nhân này");
              return;
            }
            const medicalRecordsArray = JSON.parse(JSON.stringify(res[0]));
            const mappedMedicalRecords = medicalRecordsArray.map((record) => ({
              date: record[0],
              info: record[1],
            }));
            if (mappedMedicalRecords.length === 0)
              alert("Không tìm thấy hồ sơ y tế");
            setMedicalRecords(mappedMedicalRecords);
          })
          .catch((err) => console.log(err));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const cleanAddress = patientWalletAddress.trim();
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const MedicalContract = new ethers.Contract(
          MedicalAppContractAddress,
          MedicalAppAbi.abi,
          signer,
        );

        const tx = await MedicalContract.createMedicalRecord(
          cleanAddress,
          newDate,
          newInfo,
        );
        await tx.wait();
        alert("Hồ sơ y tế đã được tạo thành công!");
        setMedicalRecords([
          ...(MedicalRecords || []),
          { date: newDate, info: newInfo },
        ]);
        setNewDate("");
        setNewInfo("");
        setShowModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleConnectMetaMask = async () => {
    if (currentAccount) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      alert("Kết nối MetaMask không thành công");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen grid grid-cols-10">
      <div className="col-span-2">
        <Navbar />
      </div>
      <div className="col-span-8 overflow-y-auto h-screen">
        <div className="mx-auto p-6">
          <div className="bg-white shadow-md rounded-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-2">
                Bảng Điều Khiển Bác Sĩ
              </h1>
              <div className="mt-2 text-gray-600">
                {currentAccount === ""
                  ? "Vui lòng kết nối ví MetaMask của bạn"
                  : `Địa chỉ ví của bạn là: ${currentAccount}`}
              </div>
              <button onClick={handleConnectMetaMask} className="mt-4">
                <img
                  src={MetaMask}
                  alt="MetaMask Fox"
                  className="w-8 h-8 inline"
                />
                <span className="ml-2 text-blue-500">Kết Nối MetaMask</span>
              </button>
            </div>

            {/* Appointment Section */}
            <div className="p-6 border-b border-gray-200 bg-blue-50/30">
              <h2 className="text-xl font-bold mb-4 text-blue-800">
                Yêu Cầu Lịch Hẹn
              </h2>
              {appointments.length === 0 ? (
                <p className="text-gray-500">Chưa có lịch hẹn.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-100/50">
                        <th className="border-b px-4 py-2 font-semibold">
                          Ví Bệnh Nhân
                        </th>
                        <th className="border-b px-4 py-2 font-semibold">
                          Ngày & Giờ
                        </th>
                        <th className="border-b px-4 py-2 font-semibold">
                          Lý Do
                        </th>
                        <th className="border-b px-4 py-2 font-semibold">
                          Trạng Thái
                        </th>
                        <th className="border-b px-4 py-2 font-semibold text-center">
                          Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr
                          key={appt._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td
                            className="px-4 py-3 text-sm font-mono text-gray-600"
                            title={appt.patientAddress}
                          >
                            {appt.patientAddress.substring(0, 6)}...
                            {appt.patientAddress.substring(38)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {appt.date} <br />{" "}
                            <span className="text-gray-500">{appt.time}</span>
                          </td>
                          <td className="px-4 py-3 text-sm">{appt.reason}</td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                appt.status === "Accepted"
                                  ? "bg-green-100 text-green-700"
                                  : appt.status === "Rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {appt.status === "Accepted"
                                ? "Đã Chấp Nhận"
                                : appt.status === "Rejected"
                                  ? "Bị Từ Chối"
                                  : "Đang Chờ Xử Lý"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center space-x-2">
                            {appt.status === "Pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateApptStatus(appt._id, "Accepted")
                                  }
                                  className="text-green-500 hover:text-green-700"
                                  title="Chấp Nhận"
                                >
                                  <FontAwesomeIcon icon={faCheck} size="lg" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateApptStatus(appt._id, "Rejected")
                                  }
                                  className="text-red-500 hover:text-red-700"
                                  title="Từ Chối"
                                >
                                  <FontAwesomeIcon icon={faBan} size="lg" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Medical Records Section */}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Hồ Sơ Y Tế Bệnh Nhân</h2>
              <form onSubmit={handleSearch} className="flex items-center mb-6">
                <input
                  className="border border-gray-300 rounded-md px-4 py-2 w-full mr-2"
                  type="text"
                  placeholder="Nhập Địa Chỉ Ví MetaMask Của Bệnh Nhân"
                  value={patientWalletAddress}
                  onChange={(e) => setPatientWalletAddress(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  type="submit"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </form>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b px-4 py-2 text-left">Ngày</th>
                    <th className="border-b px-4 py-2 text-left">Thông Tin</th>
                    <th className="border-b px-4 py-2 text-right">
                      <button
                        className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                        onClick={() => {
                          if (patientWalletAddress) setShowModal(true);
                          else alert("Hãy nhập ví bệnh nhân trước");
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} /> Thêm Hồ Sơ
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MedicalRecords?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-3">{item.date}</td>
                      <td className="px-4 py-3" colSpan="2">
                        {item.info}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-[400px]">
            <form onSubmit={handleCreate}>
              <button
                type="button"
                className="float-right text-gray-500"
                onClick={() => setShowModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <h2 className="text-lg font-bold mb-4">Hồ Sơ Y Tế Mới</h2>
              <input
                className="border rounded-md px-4 py-2 mb-3 w-full"
                type="text"
                placeholder="Nhập Ngày (ví dụ: 2024-03-15)"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
              <textarea
                className="border rounded-md px-4 py-2 mb-4 w-full h-24"
                placeholder="Nhập Chẩn Đoán / Đơn Thuốc"
                value={newInfo}
                onChange={(e) => setNewInfo(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  type="submit"
                >
                  Tải Lên Blockchain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPage;

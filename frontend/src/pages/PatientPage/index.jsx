import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faTrashAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { MedicalAppContractAddress } from "../../config";
import MedicalAppAbi from "../../MedicalApp.json";
import { ethers } from "ethers";
import MetaMask from "../../assets/images/metamask.svg";

function PatientPage() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const cookies = new Cookies();
  const navigate = useNavigate();

  const [currentAccount, setCurrentAccount] = useState("");
  const [doctorWalletAddress, setDoctorWalletAddress] = useState("");
  const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState("");

  // States cho tính năng Xem chi tiết bác sĩ
  const [showDoctorDetailsModal, setShowDoctorDetailsModal] = useState(false);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);

  // States cho tính năng Đặt lịch hẹn
  const [showApptModal, setShowApptModal] = useState(false);
  const [selectedDoctorForAppt, setSelectedDoctorForAppt] = useState(null);
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptReason, setApptReason] = useState("");

  // Hàm fetch danh sách bác sĩ được ủy quyền
  const fetchAuthorizedDoctors = async () => {
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
        const doctors = await MedicalContract.showDoctorPermit();
        if (doctors.length === 0) {
          setAuthorizedDoctors([]);
          return;
        }
        setAuthorizedDoctors(doctors);
      } else {
        alert("Đối tượng Ethereum không tồn tại!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadDoctors = async () => {
      await fetchAuthorizedDoctors();
    };
    loadDoctors();
  }, [currentAccount]);

  useEffect(() => {
    let isMounted = true;
    const insertWords = async () => {
      const words = [
        "Để cấp phép cho bác sĩ, hãy nhập địa chỉ ví MetaMask của bác sĩ và nhấp vào nút xác nhận.",
        "Để xem thông tin của bác sĩ, hãy nhấp vào nút thông tin.",
        "Để xóa quyền truy cập của bác sĩ, hãy nhấp vào nút xóa.",
        "Lưu ý: Để cấp quyền và xóa quyền từ một bác sĩ, vui lòng đảm bảo bạn có đủ SepoliaETH trong ví MetaMask của mình.",
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
        alert("Bạn ngắt kết nối tới MetaMask wallet");
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
          alert("Vui lòng kết nối tới mạng thử nghiệm Sepolia");
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
    return () => {
      const { ethereum } = window;
      if (ethereum)
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
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
        } else if (data.userType !== "patient") {
          console.error(
            "User type mismatch. Expected patient, got:",
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

  const givePermission = async (e) => {
    e.preventDefault();
    if (doctorWalletAddress === "") {
      alert("Vui lòng nhập địa chỉ ví của bác sĩ");
      return;
    }
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
        const tx = await MedicalContract.regDoctorPermit(doctorWalletAddress);
        await tx.wait();
        alert("Quyền cấp cho bác sĩ thành công!");
        setDoctorWalletAddress("");
        // Lấy lại danh sách bác sĩ được ủy quyền từ blockchain
        await fetchAuthorizedDoctors();
      }
    } catch (error) {
      console.log(error);
      alert(
        "Lỗi khi cấp quyền. Vui lòng đảm bảo bạn đã loại bỏ khoảng trắng khỏi địa chỉ.",
      );
    }
  };

  const getdoctorInfo = (doctor) => async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/doctor-info/${doctor}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${cookies.get("auth")}` },
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setSelectedDoctorDetails(data);
      setShowDoctorDetailsModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteDoctorPermit = (doctor) => async (e) => {
    e.preventDefault();
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
        const tx = await MedicalContract.deleteDoctorPermit(doctor);
        await tx.wait();
        alert("Quyền đã được xóa");
        // Lấy lại danh sách bác sĩ được ủy quyền từ blockchain
        await fetchAuthorizedDoctors();
        // Xóa thông tin chi tiết nếu đó là bác sĩ vừa xóa
        if (selectedDoctorDetails?.walletAddress === doctor) {
          setShowDoctorDetailsModal(false);
          setSelectedDoctorDetails(null);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleConnectMetaMask = async () => {
    if (currentAccount) return;
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("MetaMask không được phát hiện. Vui lòng cài đặt MetaMask.");
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

  // Mở modal đặt lịch
  const handleMakeAppointment = (doctorInfo) => {
    setSelectedDoctorForAppt(doctorInfo);
    setShowApptModal(true);
  };

  // Gửi thông tin lịch hẹn lên Backend
  const submitAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("auth")}`,
        },
        body: JSON.stringify({
          doctorAddress: selectedDoctorForAppt.walletAddress,
          date: apptDate,
          time: apptTime,
          reason: apptReason,
        }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert("Lịch hẹn đã được yêu cầu thành công!");
        setShowApptModal(false);
        setApptDate("");
        setApptTime("");
        setApptReason("");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi đặt lịch hẹn");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-2/12 bg-gray-200">
        <Navbar />
      </div>
      <div className="w-10/12 bg-white p-8 overflow-y-auto">
        <div className="bg-gray-100 rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-lg font-bold text-gray-800">
              Patient Dashboard
            </div>
            <div className="mt-2 text-gray-600">
              {currentAccount === ""
                ? "Please connect your MetaMask wallet"
                : `Your wallet address is: ${currentAccount}`}
            </div>
            <button onClick={handleConnectMetaMask} className="mt-4">
              <img
                src={MetaMask}
                alt="MetaMask Fox"
                className="w-8 h-8 inline"
              />
              <span className="ml-2 text-blue-500">Connect MetaMask</span>
            </button>
          </div>
          <div className="p-6">
            <div className="text-lg font-bold text-gray-800 mb-2">
              Instructions:
            </div>
            <div className="h-[150px] overflow-y-hidden border-b border-gray-200 mb-4">
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char"></span>
              </p>
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char"></span>
              </p>
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char"></span>
              </p>
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char"></span>
              </p>
            </div>

            <div className="flex mb-8 space-x-4">
              <div className="w-1/2">
                <div className="mb-8">
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    Trao quyền cho bác sĩ
                  </div>
                  <div className="flex">
                    <input
                      className="w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      type="text"
                      placeholder="Type wallet address..."
                      value={doctorWalletAddress}
                      onChange={(e) => setDoctorWalletAddress(e.target.value)}
                    />
                    <button
                      className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      onClick={givePermission}
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    Bác sĩ được ủy quyền
                  </div>
                  <div className="mt-4">
                    {authorizedDoctors.length === 0 ? (
                      <p className="text-gray-600">
                        Không có bác sĩ được ủy quyền
                      </p>
                    ) : (
                      authorizedDoctors.map((doctor, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border border-gray-200 p-4 rounded-lg mb-4"
                        >
                          <div className="text-gray-600 text-sm">{doctor}</div>
                          <div className="flex space-x-2">
                            <button
                              className="px-2 py-1 bg-sky-500 text-white rounded-md hover:bg-sky-600"
                              onClick={getdoctorInfo(doctor)}
                            >
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                            <button
                              className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                              onClick={deleteDoctorPermit(doctor)}
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="w-1/2">
                <div className="text-lg font-bold text-gray-800 mb-2">
                  Hướng dẫn:
                </div>
                <div className="border border-gray-200 p-4 rounded-lg text-sm text-gray-600 space-y-3">
                  <p>
                    ✓ Nhấp vào nút thông tin{" "}
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-sky-500"
                    />{" "}
                    để xem chi tiết thông tin bác sĩ
                  </p>
                  <p>
                    ✓ Nhấp vào nút xóa{" "}
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      className="text-red-500"
                    />{" "}
                    để xóa quyền truy cập của bác sĩ
                  </p>
                  <p>
                    ✓ Trong modal chi tiết, bạn có thể xem đầy đủ thông tin bác
                    sĩ và đặt lịch hẹn
                  </p>
                  <p>
                    ✓ Đảm bảo bạn có đủ SepoliaETH trong ví để thực hiện các
                    giao dịch
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Xem Chi Tiết Thông Tin Bác Sĩ */}
      {showDoctorDetailsModal && selectedDoctorDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Chi Tiết Thông Tin Bác Sĩ</h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowDoctorDetailsModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center mb-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full mr-4 flex items-center justify-center text-blue-500 font-bold text-2xl">
                  {selectedDoctorDetails.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">
                    {selectedDoctorDetails.name}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    {selectedDoctorDetails.department}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4 text-sm space-y-3">
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-semibold text-gray-700">Email:</span>
                <p className="text-gray-600 mt-1">
                  {selectedDoctorDetails.email}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-semibold text-gray-700">Bệnh Viện:</span>
                <p className="text-gray-600 mt-1">
                  {selectedDoctorDetails.hospital}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-semibold text-gray-700">Địa Chỉ Ví:</span>
                <p className="text-gray-600 mt-1 font-mono text-xs break-all">
                  {selectedDoctorDetails.walletAddress}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-semibold text-gray-700">
                  Chuyên Khoa Chi Tiết:
                </span>
                <p className="text-gray-600 mt-1">
                  {selectedDoctorDetails.specialization ||
                    selectedDoctorDetails.department ||
                    "Không có thông tin"}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => setShowDoctorDetailsModal(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => {
                  handleMakeAppointment(selectedDoctorDetails);
                  setShowDoctorDetailsModal(false);
                }}
              >
                Đặt Lịch Hẹn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đặt lịch hẹn */}
      {showApptModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-[400px]">
            <h2 className="text-lg font-bold mb-4">Đặt lịch hẹn</h2>
            <p className="text-sm text-gray-600 mb-4">
              Bác sĩ:{" "}
              <span className="font-semibold">
                {selectedDoctorForAppt?.name}
              </span>
            </p>
            <form onSubmit={submitAppointment}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Ngày</label>
                <input
                  type="date"
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Thời gian
                </label>
                <input
                  type="time"
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Lý do đến khám
                </label>
                <textarea
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 w-full h-24"
                  placeholder="E.g., Headache for 2 days..."
                  value={apptReason}
                  onChange={(e) => setApptReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  onClick={() => setShowApptModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientPage;

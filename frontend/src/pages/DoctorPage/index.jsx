import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { MedicalAppContractAddress } from "../../config";
import MedicalAppAbi from "../../MedicalApp.json";
import Navbar from "../../components/Navbar";
import MetaMask from "../../assets/images/metamask.svg";
const ethers = require("ethers");

function DoctorPage() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const cookies = new Cookies();
  const navigate = useNavigate();

  const [MedicalRecords, setMedicalRecords] = useState();
  const [patientWalletAddress, setPatientWalletAddress] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newInfo, setNewInfo] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");

  useEffect(() => {
    let isMounted = true;

    // Function to insert words into spans one by one
    const insertWords = async () => {
      const words = [
        "Xem hồ sơ y tế của bệnh nhân, nhập địa chỉ ví MetaMask của bệnh nhân và nhập vào nút tìm kiếm. Để thêm bản ghi y tế mới, nhập vào dấu + ở phía phải.",
        "Lưu ý: Bạn chỉ có thể xem hồ sơ y tế của các bệnh nhân đã phép bạn xem.",
        "Tải lên bản ghi y tế lên blockchain yêu cầu phí gas. Vui lòng chắc chắn bạn có đủ SepoliaETH trong ví MetaMask của bạn.",
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
        // User disconnected their MetaMask account
        setCurrentAccount("");
        alert("Bạn đã ngắt kết nối ví MetaMask của mình");
        // navigate("/");
      } else {
        // User switched or connected a new account
        setCurrentAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      if (chainId !== "0xaa36a7") {
        // User switched to a different network
        alert("Vui lòng kết nối với mạng thử nghiệm Sepolia");
        // navigate("/");
        return;
      }
    };

    const connectAndCheckNetwork = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          alert("MetaMask chưa được phát hiện. Vui lòng cài đặt MetaMask.");
          // navigate("/");
          return;
        }
        // event listener when user switches account
        ethereum.on("accountsChanged", handleAccountsChanged);
        // event listener when user switches network
        ethereum.on("chainChanged", handleChainChanged);
        let chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("Kết nối với chuỗi " + chainId);
        // make sure user connects to Sepolia testnet
        const sepoliaId = "0xaa36a7";
        if (chainId !== sepoliaId) {
          alert("Vui lòng kết nối với mạng thử nghiệm Sepolia");
          // navigate("/");
          return;
        }
        // connect to MetaMask wallet
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Kết nối với ví MetaMask: " + accounts[0]);
        setCurrentAccount(accounts[0]);
        console.log(currentAccount);
      } catch (error) {
        console.log(error);
        // alert("Error connecting to MetaMask wallet");
        // navigate("/");
      }
    };
    connectAndCheckNetwork();
    return () => {
      const { ethereum } = window;
      if (ethereum) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // authenticate user
  useEffect(() => {
    fetch(`${apiUrl}/auth-endpoint`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookies.get("auth")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
          navigate("/");
        }
        if (data.userType !== "doctor") {
          console.log("You are not a doctor");
          navigate("/");
        }
        console.log(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  // 1. Get medical records from blockchain
  const handleSearch = async (event) => {
    event.preventDefault();
    if (patientWalletAddress === "") {
      alert("Vui lòng nhập địa chỉ ví của bệnh nhân");
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
        MedicalContract.getMedical(patientWalletAddress)
          .then((res) => {
            console.log(res);
            if (res[1] === false) {
              alert("Bạn không được phép xem hồ sơ y tế của bệnh nhân này");
              return;
            }
            // Convert the Proxy object to a regular JavaScript object
            const medicalRecordsArray = JSON.parse(JSON.stringify(res[0]));
            console.log(medicalRecordsArray);

            // Map the array of arrays into an array of objects
            const mappedMedicalRecords = medicalRecordsArray.map((record) => ({
              date: record[0], // assuming the date is at index 0
              info: record[1], // assuming the info is at index 1
            }));
            console.log(mappedMedicalRecords);

            if (mappedMedicalRecords.length === 0) {
              alert("Không tìm thấy hồ sơ y tế");
            }

            setMedicalRecords(mappedMedicalRecords);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        alert("Đối tượng Ethereum không tồn tại!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 2. Add new medical record to blockchain
  const handleCreate = async (event) => {
    event.preventDefault();
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

        // create medical record on blockchain
        const tx = await MedicalContract.createMedicalRecord(
          patientWalletAddress,
          newDate,
          newInfo,
        );
        // Wait for transaction to be mined
        const receipt = await tx.wait();

        // Listen for the emitted event
        const filter = MedicalContract.filters.MedicalRecordCreated();
        const events = await MedicalContract.queryFilter(
          filter,
          receipt.blockNumber,
        );

        // Check the latest emitted event
        const latestEvent = events[events.length - 1];
        console.log(latestEvent);

        if (latestEvent.args.success) {
          alert("Bản ghi y tế đã được tạo thành công!");
          setMedicalRecords([
            ...MedicalRecords,
            { date: newDate, info: newInfo },
          ]);
        } else {
          alert("Tạo bản ghi y tế không thành công!");
        }
        setNewDate("");
        setNewInfo("");
        setShowModal(false);
      } else {
        alert("Đối tượng Ethereum không tồn tại!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenModal = () => {
    if (patientWalletAddress === "") {
      alert("Vui lòng nhập địa chỉ ví của bệnh nhân");
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 3. connect to MetaMask wallet
  const handleConnectMetaMask = async () => {
    if (currentAccount) {
      alert("Bạn đã kết nối địa chỉ ví của mình");
      return;
    }
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
        alert(`Địa chỉ ví kết nối: ${accounts[0]}`);
      } catch (error) {
        alert("Kết nối MetaMask không thành công");
      }
    } else {
      alert("MetaMask chưa được phát hiện");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen grid grid-cols-10">
      {/* Navbar */}
      <div className="col-span-2">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="col-span-8">
        <div className="mx-auto p-6 h-full">
          <div className="bg-white shadow-md rounded-md">
            <div className="px-6 py-4 border-b border-gray-200 h-full">
              <h1 className="text-2xl font-bold mb-2">
                Bảng điều khiển Bác sĩ
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
                <span className="ml-2 text-blue-500">Kết nối MetaMask</span>
              </button>
            </div>
            {/* Instruction */}
            <div className="p-6 h-[200px] overflow-y-hidden">
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
            <div className="p-6 h-[500px]">
              <div className="mb-6">
                <p className="text-lg font-bold mb-2">Hồ sơ Y tế Bệnh Nhân</p>
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    className="border border-gray-300 rounded-md px-4 py-2 w-full mr-2"
                    type="text"
                    placeholder="Nhập địa chỉ ví MetaMask của bệnh nhân"
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
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="border-b border-gray-300 px-4 py-2">Ngày</th>
                    <th className="border-b border-gray-300 px-4 py-2">
                      Thông tin
                    </th>
                    <th className="border-b border-gray-300 px-4 py-2 text-right">
                      <button
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                        onClick={handleOpenModal}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MedicalRecords?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="px-4 py-2 text-center">{item.date}</td>
                      <td className="px-4 py-2 text-center" colSpan="1">
                        {item.info}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                  <div className="bg-white p-6 rounded-md shadow-md">
                    <form onSubmit={handleCreate}>
                      <button
                        className="relative top-0 float-right"
                        onClick={handleCloseModal}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <h2 className="text-lg font-bold mb-4">Bản Ghi Mới</h2>
                      <input
                        className="border border-gray-300 rounded-md px-4 py-2 mb-2 w-full"
                        type="text"
                        placeholder="Nhập ngày"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                      <input
                        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
                        type="text"
                        placeholder="Nhập thông tin"
                        value={newInfo}
                        onChange={(e) => setNewInfo(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <button
                          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mr-2"
                          type="submit"
                        >
                          Tạo
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorPage;

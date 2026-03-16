import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./RegisterPage.css";
import { useNavigate } from "react-router-dom";
import MetaMask from "../../assets/images/metamask.svg";

const RegistrationForm = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const navigate = useNavigate();
  // get the userType from the URL path
  const { userType } = useParams();
  const [error, setError] = useState("");

  const [walletAddress, setWalletAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Additional state variables for doctor-specific fields
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hospital, setHospital] = useState("");
  const [department, setDepartment] = useState("");

  // Additional state variables for patient-specific fields
  const [hkid, setHkid] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");

  const handleConnectMetaMask = async () => {
    if (walletAddress) {
      setError("Bạn đã kết nối địa chỉ ví của mình");
      return;
    }
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        setError("Kết nối MetaMask không thành công");
      }
    } else {
      setError("MetaMask chưa được phát hiện");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Perform validation
    // check if wallet address is connected
    if (!walletAddress) {
      setError("Vui lòng kết nối địa chỉ ví của bạn");
      return;
    }

    // check if the email is valid
    let emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Vui lòng nhập một địa chỉ email hợp lệ");
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    // Check if the phone number is valid
    // let phoneRegex = /^\d{8}$/;
    // if (!phoneRegex.test(phone)) {
    //   setError("Please enter a valid phone number");
    //   return;
    // }

    // Check if the HKID is valid
    // let hkidRegex = /^[A-Z]\d{6}\([A0-9]\)$/;
    // if (!hkidRegex.test(hkid)) {
    //   setError("Please enter a valid HKID");
    //   return;
    // }

    // Construct the user object based on the selected userType
    const user = {
      userType,
      walletAddress,
      name,
      email,
      password,
      phone,
      ...(userType === "doctor" && {
        registrationNumber,
        hospital,
        department,
      }),
      ...(userType === "patient" && {
        hkid,
        address,
        birthday,
      }),
    };

    // Perform API call to register the user
    const response = await fetch(`${apiUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    }).then((res) => res.json());

    if (response.success) {
      alert("Người dùng được đăng ký thành công");
      navigate("/");
    } else {
      setError(response.error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} autoComplete="on" className="w-[60vw]">
          <h2 className="text-2xl font-bold text-center">Đăng Ký</h2>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block">
                Tên:
              </label>
              <input
                type="text"
                placeholder="Nhập tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="email" className="block">
                Email:
              </label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="block">
                Mật khẩu:
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block">
                Xác nhận Mật Khẩu:
              </label>
              <input
                type="password"
                placeholder="Xác nhận mật khẩu của bạn"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
            {userType === "doctor" && (
              <>
                <div>
                  <label htmlFor="phone" className="block">
                    Thư Cố:
                  </label>
                  <input
                    type="tel"
                    placeholder="Nhập số thư cố của bạn"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="registrationNumber" className="block">
                    Số ĐK Bởn:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số đk bớn của bạn"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="hospital" className="block">
                    Bệnh Viện:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập bệnh viện của bạn"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block">
                    Phòng Khám:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập phòng khám của bạn"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
              </>
            )}
            {userType === "patient" && (
              <>
                <div>
                  <label htmlFor="phone" className="block">
                    Thư Cố:
                  </label>
                  <input
                    type="tel"
                    placeholder="Nhập số thư cố của bạn"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="hkid" className="block">
                    CMND/CCCD:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập CMND/CCCD của bạn"
                    value={hkid}
                    onChange={(e) => setHkid(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block">
                    Địa Chỉ:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ của bạn"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="birthday" className="block">
                    Ngày Sinh:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập ngày sinh của bạn"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="walletAddress" className="block">
                Địa Chỉ Ví:
              </label>
              <div className="flex justify-between items-end gap-2">
                <input
                  className="border border-gray-300 rounded-md p-2 w-full"
                  type="text"
                  placeholder="Nhấn vào con chó để kết nối MetaMask"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                  readOnly
                />
                <button
                  className="border border-gray-300 rounded-md p-2 text-white font-bold bg-gray-200 hover:bg-gray-300"
                  type="button"
                  onClick={handleConnectMetaMask}
                >
                  <img src={MetaMask} alt="MetaMask" className="w-8 h-6" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button
              className="border border-gray-300 rounded-md p-2 bg-gray-400 text-white font-bold hover:bg-gray-500"
              type="button"
              onClick={() => window.history.back()}
            >
              Quay Lại
            </button>
            <button className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white font-bold hover:bg-blue-600">
              Gửi
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;

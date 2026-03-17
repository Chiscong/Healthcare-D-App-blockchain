// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract MedicalApp {
    // structs
    struct Patients {
        MedicalRecord[] medicalRecords;
        address[] DoctorPermit;
    }

    struct MedicalRecord{
        string datetime;
        string info;
    }

    // mapping
    mapping (address => Patients) patients;

    // modifier
    address public manager;

    // FIX: Thêm constructor để gán người deploy là manager
    constructor() {
        manager = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == manager, "You are not the manager");
        _;
    }

    // Doctor functions
    function getMedical(address patient_address) public view returns (MedicalRecord[] memory, bool){
        bool isCheck = false;
        for(uint i = 0; i < patients[patient_address].DoctorPermit.length; i++){
            if(patients[patient_address].DoctorPermit[i] == msg.sender){
                isCheck = true;
                break; // Tối ưu: Tìm thấy thì dừng vòng lặp luôn để tiết kiệm Gas
            }
        }
        
        if(isCheck){
            return (patients[patient_address].medicalRecords, true);
        } else {
            MedicalRecord[] memory empty;
            return (empty, false);
        }
    }

    function createMedicalRecord(address patient_address, string memory datetime, string memory info) public returns (bool){
        bool isCheck = false;
        for(uint i = 0; i < patients[patient_address].DoctorPermit.length; i++){
            if(patients[patient_address].DoctorPermit[i] == msg.sender){
                isCheck = true;
                break; // Tối ưu Gas
            }
        }
        
        if(isCheck){
            MedicalRecord memory newMedicalRecord = MedicalRecord(datetime, info);
            patients[patient_address].medicalRecords.push(newMedicalRecord);
            return true;
        } else {
            return false;
        }
    }

    // Patient functions
    function regDoctorPermit(address doctor_address) public payable returns (bool){
        bool isCheck = false;
        for(uint i = 0; i < patients[msg.sender].DoctorPermit.length; i++){
            if(patients[msg.sender].DoctorPermit[i] == doctor_address){
                isCheck = true;
                break;
            }
        }
        
        if (isCheck){
            // Nếu đã cấp quyền rồi mà vẫn gọi hàm có gửi tiền -> Hoàn trả lại tiền (revert)
            revert("The doctor is already permitted");
        } else {
            patients[msg.sender].DoctorPermit.push(doctor_address);
            
            // FIX: LOGIC CHUYỂN TIỀN CHO BÁC SĨ
            // Nếu bệnh nhân có đính kèm ETH (msg.value > 0) khi gọi hàm, chuyển số tiền đó vào ví bác sĩ
            if (msg.value > 0) {
                payable(doctor_address).transfer(msg.value);
            }
            
            return true;
        }
    }

    function showDoctorPermit() public view returns (address[] memory){
        return patients[msg.sender].DoctorPermit;
    }

    function deleteDoctorPermit(address doctor_address) public returns (bool, string memory){
        uint length = patients[msg.sender].DoctorPermit.length;
        
        for(uint i = 0; i < length; i++){
            if(patients[msg.sender].DoctorPermit[i] == doctor_address){
                
                // FIX: XÓA TRIỆT ĐỂ KHỎI MẢNG TRÁNH LỖI ENS NAME TRÊN FRONTEND
                // B1: Đưa phần tử cuối cùng của mảng đè lên vị trí của phần tử cần xóa
                patients[msg.sender].DoctorPermit[i] = patients[msg.sender].DoctorPermit[length - 1];
                
                // B2: Cắt bỏ đuôi mảng (xóa hoàn toàn)
                patients[msg.sender].DoctorPermit.pop();
                
                return (true, "The doctor is deleted");
            }
        }
        return (false, "The doctor is not in the list");
    }
}
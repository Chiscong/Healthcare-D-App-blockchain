require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    sepolia: {
      provider: () =>
        new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL),
      network_id: 11155111,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 500,
      networkCheckTimeout: 1000000, // Tăng thời gian chờ lên cực đại
      pollingInterval: 15000, // Tăng khoảng thời gian truy vấn block lên 15 giây
      skipDryRun: true,
      disableConfirmationListener: true
    },
  },

  compilers: {
    solc: {
      version: "0.8.20", // Thay đổi từ 0.8.15 thành 0.8.20
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};

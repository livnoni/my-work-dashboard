const local = true;

const config = {
  tenBisAuthUrl: `${local ? "https://cors-anywhere.herokuapp.com/" : ""}https://www.10bis.co.il/NextApi/GetUser`,
  userActivity: `${local ? "https://cors-anywhere.herokuapp.com/" : ""}https://www.10bis.co.il/NextApi/UserTransactionsReport`,
  israelRailApi: "https://www.rail.co.il/apiinfo/api/Plan"
};

export default config;
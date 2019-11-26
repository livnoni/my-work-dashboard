import React, {useState} from 'react';
import axios from "axios";
import "./tenBis.css"
import Loading from "../Loading/loading"
import config from "../../config";


function TenBis(props) {
    const [tenBisData, setTenBisData] = useState({});
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    const getData = async () => {
        console.info("getting ten bis auth...")
        setLoading(true);
        try {
            // let authResponse = await axios.post("https://cors-anywhere.herokuapp.com/https://www.10bis.co.il/NextApi/GetUser", {
            // let authResponse = await axios.post("https://www.10bis.co.il/NextApi/GetUser", {
            let authResponse = await axios.post(config.tenBisAuthUrl, {
                "UiCulture": "he",
                "Email": username,
                "Password": password
            })
            // console.log("authResponse=", authResponse);
            if (!authResponse.data.Success) {
                setHasError(true);
                return;
            }
            const {userToken} = authResponse.data.Data;
            // let userActivityResponse = await axios.get("https://cors-anywhere.herokuapp.com/https://www.10bis.co.il/NextApi/UserTransactionsReport", {
            // let userActivityResponse = await axios.get("https://www.10bis.co.il/NextApi/UserTransactionsReport", {
            let userActivityResponse = await axios.get(config.userActivity, {
                params: {
                    userToken,
                    culture: "he-IL",
                    uiCulture: "he",
                    timestamp: new Date().getTime(),
                    dateBias: 0
                }
            });
            // console.log("userActivityResponse=", userActivityResponse);
            if (!userActivityResponse.data.Success) {
                setHasError(true);
                return;
            }

            const {userId, firstName, lastName, email, cellphone, companyId, isCompanyAdmin} = authResponse.data.Data;

            // console.log("userActivityResponse.data.Data=", userActivityResponse.data.Data)

            const companyReportRange = userActivityResponse.data.Data.companyReportRange;
            const startDate = companyReportRange.startDateStr;
            const endDate = companyReportRange.endDateStr;
            const moneycard = userActivityResponse.data.Data.moneycards[0];
            const {cardSuffix} = moneycard;
            const limitationMonthly = moneycard.limitation.monthly;
            const usageMonthly = moneycard.usage.monthly;
            const usageDaily = moneycard.usage.daily;
            const balanceMonthly = moneycard.balance.monthly;
            const balanceDaily = moneycard.balance.daily;
            setTenBisData({
                userId,
                firstName,
                lastName,
                email,
                cellphone,
                companyId,
                isCompanyAdmin,
                startDate,
                endDate,
                cardSuffix,
                limitationMonthly,
                usageMonthly,
                usageDaily,
                balanceMonthly,
                balanceDaily
            });

            setHasError(false);
        } catch (e) {
            console.error("TenBis: getData error: ", e);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={"tenBisContainer"}>
            <h2>Ten Bis Info:</h2> {tenBisData.balanceMonthly ?
            <h3>Total Left: {tenBisData.balanceMonthly} ₪</h3> : null}

            <form>
                Email:<br/>
                <input type="text" className={"username-input"} name="username" value={username} onChange={(event) => {
                    setUsername(event.target.value)
                }}/>
                <br/>
                Password:<br/>
                <input type="password" className={"password-input"} name="password" value={password}
                       onChange={(event) => {
                           setPassword(event.target.value)
                       }}/>
                <br/><br/>
                <button type="button" disabled={(loading || !username || !password) ? true : false}
                        onClick={getData}>Get Ten Bis Data
                </button>
            </form>
            {hasError ? <h2>ERROR!</h2> : null}
            <Loading loading={loading}/>
            {<ul className={"tenbis-ul"}>
                {Object.keys(tenBisData).map(key =>
                    <li key={`li-${key}`}>
                        {key}:<b>{tenBisData[key]}</b>{(typeof tenBisData[key] === "number" && key!=="companyId" && key!== "userId") ? " ₪" : ""}
                    </li>)}
            </ul>}
        </div>
    )
}

export default TenBis;
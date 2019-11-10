import React, {useState, useEffect} from 'react';
import axios from "axios";
import "./rail.css";
import Loading from "../Loading/loading";
import stations from "../../stations.json";
import utils from "../utils/utils";
import config from "../../config";

const roshHayainNorthStationNum = 8800;
const telAvivHashalomStationName = 4600;

const inputFormatToDate = (inputFormat) => {
    let [year, month, day] = inputFormat.split("-");
    return new Date(Number(year), Number(month - 1), Number(day));
};

const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
};

function Rail(props) {
    const [trains, setTrains] = useState([]);
    const [fromStationCode, setFromStationCode] = useState(Number(localStorage.getItem("fromStationCode")) || telAvivHashalomStationName);
    const [toStationCode, setToStationCode] = useState(Number(localStorage.getItem("toStationCode")) || roshHayainNorthStationNum);
    const [loading, setLoading] = useState(false);
    const {trainDate, maxRoutes} = props;

    const getTrainsOfToday = async () => {
        try {
            setLoading(true);
            setTrains([]);
            let params = {
                OId: toStationCode,
                TId: fromStationCode,
                Date: trainDate.split("-").join(""),
                // Date: "20191024", //example of date format
                Hour: "2400",
                isGoing: true
            };
            if (isToday(inputFormatToDate(trainDate))) {
                console.info("the time is for today. add c param (show only relevant routes )");
            }
            params.c = new Date().getTime();
            let response = await axios.get(config.israelRailApi,
                {
                    params: {
                        OId: toStationCode,
                        TId: fromStationCode,
                        Date: trainDate.split("-").join(""),
                        // Date: "20191024",
                        Hour: "2400",
                        c: new Date().getTime(),
                        isGoing: true
                    }
                })
            let trains = response.data.Data.Routes || [];
            trains = trains.map(route => {
                let train = route.Train[0];
                if (train) {
                    return {
                        arrivalTime: train.ArrivalTime,
                        departureTime: train.DepartureTime,
                        estTime: route.EstTime
                    }
                }
                return null;
            });
            setTrains(trains);
        } catch (e) {
            throw e;
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(!props.alert) return;
        const interval = setInterval(()=>{
            const trainTimeToDate = (trainTime) =>{
                let [day,month,year] = trainTime.split(" ")[0].split("/");
                let [hour,minute,second] = trainTime.split(" ")[1].split(":");
                return new Date(Number(year), Number(month - 1), Number(day), Number(hour), Number(minute), Number(second));
            };

            let currentDate = new Date();
            trains.forEach(train=>{
                let {departureTime} = train;
                let departureDate = trainTimeToDate(departureTime);
                let timeDiff_minutes = (departureDate - currentDate) / (1000*60);
                if( timeDiff_minutes > 0 && timeDiff_minutes < props.alertBefore && timeDiff_minutes > (props.alertBefore - 1)){
                    console.info("train: ",train, "arrive in ",timeDiff_minutes, "minutes!");
                    utils.notify(`your train is about to arrive in a ${props.alertBefore} minutes`, props.sound);
                }
            });
        }, 1000*60);
        const stopInterval = ()=> clearInterval(interval);
        return stopInterval;

    },[props.sound,props.alert,trains, props.alertBefore]);

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        getTrainsOfToday();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (trainDate) getTrainsOfToday();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trainDate]);

    const onSelectFromStationChange = (event) => {
        localStorage.setItem("fromStationCode", event.target.value);
        setFromStationCode(Number(event.target.value));
        getTrainsOfToday();
    };
    const onSelectToStationChange = (event) => {
        localStorage.setItem("toStationCode", event.target.value);
        setToStationCode(Number(event.target.value));
        getTrainsOfToday();
    };

    const onSwitchDirectionClicked = ()=>{
        let f = fromStationCode;
        let t = toStationCode;
        setToStationCode(f);
        setFromStationCode(t);
    };

    return (
        <div className={"trainContainer"}>
            <div className={"title-container"}>
                <h2>When Is my Train ?</h2>
                <h3>Date: {inputFormatToDate(trainDate).toDateString()}</h3>
                From:
                <select onChange={onSelectFromStationChange} className={"hebrew-text"}>
                    {Object.keys(stations).map(stationCode => <option key={`option-station-code-${stationCode}`}
                                                                      value={Number(stationCode)}
                                                                      selected={Number(stationCode) === fromStationCode}>{stations[stationCode]}</option>)}
                </select><br/>
                To:
                <select onChange={onSelectToStationChange} className={"hebrew-text"}>
                    {Object.keys(stations).map(stationCode => <option key={`option-station-code-${stationCode}`}
                                                                      value={Number(stationCode)}
                                                                      selected={Number(stationCode) === toStationCode}>{stations[stationCode]}</option>)}
                </select><br/>
                <div className={"switch-direction-container"}>
                    <button onClick={onSwitchDirectionClicked}>&#8633; Switch direction &#8633;</button>
                </div>
            </div>
            <div className={"trains-container"}>
                <Loading loading={loading}/>
                {trains.slice(0, maxRoutes).map((train, index) => {
                    return (
                        <div className={"single-train-container"} key={`train-${index}`}>
                            <span>DepartureTime: {train.departureTime.split(" ")[0]}<b> {train.departureTime.split(" ")[1]}</b></span>
                            <span>ArrivalTime: {train.arrivalTime}</span>
                            <span>EastTime: {train.estTime}</span>
                        </div>
                    )
                })}
                {(trains.length === 0 && !loading) ? <h3 className={"hebrew-text"}>לא נמצאו רכבות.</h3> : null}
            </div>
        </div>
    )

}

export default Rail;
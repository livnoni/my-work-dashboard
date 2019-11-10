import React, {useState, useEffect} from 'react';
import './App.css';
import TenBis from "./components/TenBis/tenBis";
import Rail from "./components/Rail/rail";
import utils from "./components/utils/utils";

const dateToInputFormat = (date) => {
    let mounth = date.getMonth() + 1;
    if (mounth < 10) mounth = `0${mounth}`;
    let day = date.getMonth();
    if (day < 10) mounth = `0${day}`;

    return `${date.getFullYear()}-${mounth}-${day}`;
};

const SYNC_INTERVALS = [1, 5, 10, 30, 60, 120, 180, 240, 300, 360, 420, 480];

utils.requestPermission();

function App() {
    const [trainDate, setTrainDate] = useState(dateToInputFormat(new Date()));
    const [maxRoutes, setMaxRoutes] = useState(localStorage.getItem("maxRoutes") || 10);
    const [syncIntervals, setSyncIntervals] = useState(Number(localStorage.getItem("syncIntervals")) || 5);
    const [alert, setAlert] = useState(typeof localStorage.getItem("alert") === "string" ? Number(localStorage.getItem("alert")) : 1);
    const [sound, setSound] = useState(typeof localStorage.getItem("sound") === "string" ? Number(localStorage.getItem("sound")) : 1);
    const [alertBefore, setAlertBefore] = useState(typeof localStorage.getItem("alertBefore") === "string" ? Number(localStorage.getItem("alertBefore")) : 20);

    useEffect(() => {
        setTimeout(function () {
            window.location.reload();
        }, syncIntervals * 1000 * 60);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onDateInputChange = (event) => {
        setTrainDate(event.target.value);
    };

    const onMaxRoutesChange = (event) => {
        localStorage.setItem("maxRoutes", event.target.value);
        setMaxRoutes(event.target.value);
    };

    const onSelectSyncIntervals = (event) => {
        localStorage.setItem("syncIntervals", event.target.value);
        setSyncIntervals(event.target.value);
    };

    const onAlertCheckBoxChange = () => {
        let status = Number(alert);
        status += 1;
        status = status % 2;
        localStorage.setItem("alert", status.toString());
        setAlert(status);
    };

    const onSoundCheckBoxChange = () => {
        let status = Number(sound);
        status += 1;
        status = status % 2;
        localStorage.setItem("sound", status.toString());
        setSound(status);
    };

    const onAlertBeforeChange = (event) => {
        localStorage.setItem("alertBefore", event.target.value);
        setAlertBefore(event.target.value);
    };

    const testSound = ()=>{
        utils.notify(`your train is about to arrive in a ${alertBefore} minutes`, sound);
    };

    return (
        <div className="App">
            <h1 className={"app-title"}>LIVNONI DASHBOARD</h1>
            <div className="Components">
                <TenBis/>
                <div className={"setting-container"}>
                    <h2>Setting:</h2>
                    Date: <input type="date" value={trainDate} name="date-input" onChange={onDateInputChange}/><br/>
                    Sync Interval:
                    <select onChange={onSelectSyncIntervals}>
                        {SYNC_INTERVALS.map(interval => <option key={`option-interval-${interval}`}
                                                                value={interval}
                                                                defaultValue={interval === syncIntervals}>{interval < 60 ? `${interval} minutes` : `${interval / 60} hours`}</option>)}
                    </select><br/>
                    Max routes to display: <input type="number" name="max-routes" min={"5"} max={"50"} value={maxRoutes}
                                                  onChange={onMaxRoutesChange}/><br/>
                    Alert: <input type="checkbox" checked={alert} onChange={onAlertCheckBoxChange}/>
                    {alert ?
                        <React.Fragment>
                            <input type="number" name="max-routes" min={"1"} max={"60"} value={alertBefore} onChange={onAlertBeforeChange}/> Minutes before
                        </React.Fragment>
                        : null}
                    <br/>
                    Sound: <input type="checkbox" checked={sound} onChange={onSoundCheckBoxChange}/>
                    {sound ?
                        <React.Fragment>
                            <button onClick={testSound}>Test Sound</button>
                        </React.Fragment>
                        : null}
                    <br/>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}>Reset to default setting
                    </button>
                </div>
                <Rail trainDate={trainDate} maxRoutes={maxRoutes} sound={sound} alert={alert} alertBefore={alertBefore}/>
            </div>
        </div>


    );
}

export default App;

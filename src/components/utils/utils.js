const utils ={
    requestPermission: ()=>{
        if (("Notification" in window)) {
            Notification.requestPermission().then(function (result) {
                console.log(result);
            });
        }
    },

    notify : (text, sound) =>{
        const makeNotify = ()=>{
            try {
                new window.Notification(text);
            }catch (e) {
                console.error("Notification error: ",e);
            }
            if(sound){
                try {
                    let msg = new window.SpeechSynthesisUtterance(text);
                    window.speechSynthesis.speak(msg);
                }catch (e) {
                    console.error("SpeechSynthesisUtterance error:",e)
                }
            }
        };

        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            console.error("This browser does not support desktop notification");
            return;
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            makeNotify();
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    makeNotify();
                }
            });
        }
    }
};


export default utils;
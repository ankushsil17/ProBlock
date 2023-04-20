function CloseTab() {
    //alert("This URL is completely blocked for 1 hour. This tab will close after you press OK")
    chrome.runtime.sendMessage({ CloseMe: true })
}

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.from === "popup" && message.subject === "startTimer") {

        var hour = 0;
        var min = 0;
        var sec = 5;

        var div = document.createElement("div")
        div.innerHTML = `
            <div class="PROBtopItem">
                <h1>PROBLOCK</h1>
                <div class="PROBtopItemMain">
                    <div class="PROBInfo">
                        <p>You are currently on :</p>
                        <h4 id="PROBurl">${window.location.hostname}</h4>
                    </div>
                </div>
            </div>
    
            <div class="PROBbottomItem">
                <div class="PROBtimeCont">
                    <p>Time Remaining</p>
                    <div class="PROBtime">
                        <div class="PROBnumber">
                            <p id="PROBhour">${("0" + hour).slice(-2)}</p>
                        </div>
                        <span>:</span>
        
                        <div class="PROBnumber">
                            <p id="PROBmin">${("0" + min).slice(-2)}</p>
                        </div>
                        <span>:</span>
        
                        <div class="PROBnumber">
                            <p id="PROBsec">${("0" + sec).slice(-2)}</p>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.prepend(div)

        setInterval(() => {
            if (sec >= 1) {
                sec = sec - 1
                document.getElementById("PROBsec").innerText = ("0" + sec).slice(-2)
            }
            else {
                CloseTab()
            }
        }, 1000);

    }
})

chrome.storage.local.get("BlockedUrls", (data) => {
    if (data.BlockedUrls !== undefined) {
        if (data.BlockedUrls.some((e) => e.url === window.location.hostname && e.status === "BLOCKED")) {
            CloseTab()
        }
    }
})
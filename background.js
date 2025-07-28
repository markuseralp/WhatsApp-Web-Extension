document.getElementById("submitbutton").addEventListener("click", (event) => {
    event.preventDefault();

    const fileInput = document.querySelector("input[type=file]");
    const file = fileInput.files[0]; //get selected file

    if (file) { //if file exists read using file reader
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            const dataURL = reader.result;
            imageHandler(dataURL, true); //check if file is uploaded
        });

        reader.readAsDataURL(file); //read file as a data url
    } else {
        const urlInput = document.getElementById('link').value; //if there is no file chdck the link element
        imageHandler(urlInput, false);
    }
});

document.getElementById("clearbutton").addEventListener("click", (event) => {
    event.preventDefault();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { //message passing to content script in active tab
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "clear", message: '', upload: false },
                function (response) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    } else if (response) {
                        console.log("Response from content script:", response);
                    }
                }
            );
        } else {
            console.error("No active tab found.");
        }
    });
})

document.getElementById("cover").addEventListener("click", (event) => { //function to change background size
    event.preventDefault();
    updateBackgroundSize("cover");
});

document.getElementById("contain").addEventListener("click", (event) => { //""
    event.preventDefault();
    updateBackgroundSize("contain");
});

function updateBackgroundSize(sizeType) { //util function to message pass content script to update backgroundSize
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "changeSize", size: sizeType },
                function (response) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    } else if (response) {
                        console.log("Updated size to:", sizeType);
                    }
                }
            );
        } else {
            console.error("No active tab found.");
        }
    });
}

//handles both linked gifs and images uploaded, message pass to content script
function imageHandler(imageVal, isUpload) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "changeBackground", message: imageVal, upload: isUpload },
                function (response) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    } else if (response) {
                        console.log("Response from content script:", response);
                    }
                }
            );
        } else {
            console.error("No active tab found.");
        }
    });
}

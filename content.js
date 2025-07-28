let urlInput3List = []; //init array to store background media and settings

chrome.storage.local.get("urlInput3List", function (result) { //load exisiting or set empty
    urlInput3List = result.urlInput3List || [];
});

//listen for messages passed from the extension (background)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const chatID = getChatUniqueID(); //gets the id for each chat with different people
    if (request.type === "changeBackground") { //call to add new background
        if (chatID) {
            updateBackground(chatID, request.message, request.upload);
        }
    } else if (request.type === "clear") { //call to remove background
        if (chatID) {
            updateBackground(chatID, '', false);
        }
    } else if (request.type === "changeSize") { //call to update the size of the background
        if (chatID) {
            changeSizeOnly(chatID, request.size);
        }
    } else {
        console.log("Received unexpected message type:", request.type);
    }
});

function getChatUniqueID() { //gets the unique ID from the chat element
    const chatElement = document.getElementsByClassName("_amjv _aotl")[0];
    if (chatElement && chatElement.hasAttribute("data-id")) {
        let chatID = chatElement.getAttribute("data-id");

        chatID = chatID.substring(chatID.indexOf("-") + 1, chatID.indexOf("@")); //id is contained in string of characters between - and @
        if (chatID.includes("true")) { //clean up
            chatID = chatID.substring(5);
        } else if (chatID.includes("false")) {
            chatID = chatID.substring(6);
        }
        return chatID;
    }
    return null;
}



function updateBackground(chatID, url, upload) { //update background for currently opened chat
    let existingChat = urlInput3List.find(item => item.chatID === chatID);

    if (!url || url === '') { //remove url if clear is pressed
        urlInput3List = urlInput3List.filter(item => item.chatID !== chatID);
    } else {
        const size = upload ? "contain" : "cover";
        if (existingChat) {
            existingChat.url = url; //update exisiting information
            existingChat.size = size;
        } else {
            urlInput3List.push({ chatID: chatID, url: url, size: size }); //add new information
        }
    }

    chrome.storage.local.set({ urlInput3List: urlInput3List }); //store locally in chrome storage
    setbackground(chatID); //visually apply background
}

function setbackground(chatID) {
    const target = document.querySelector('div[data-asset-chat-background-dark="true"]'); //selects background element
    if (target) {
        const foundObj = urlInput3List.find(item => item.chatID === chatID);
        if (foundObj && foundObj.url) { //apply styles if a background is defined
            target.style.opacity = 1; //default opacity for whatsapp web is 0.06, update so background is not transparent
            target.style.backgroundImage = `url("${foundObj.url}")`;
            target.style.backgroundSize = foundObj.size || "cover";
            target.style.backgroundPositionX = "center";

        } else { //clear if not found
            target.style.backgroundImage = "";
        }
    }
}

function changeSizeOnly(chatID, size) { //change background to cover or contain
    const target = document.querySelector('div[data-asset-chat-background-dark="true"]');
    if (target) {
        target.style.backgroundSize = size;

        const entry = urlInput3List.find(item => item.chatID === chatID); //update storage with new size
        if (entry) {
            entry.size = size;
            chrome.storage.local.set({ urlInput3List: urlInput3List });
        }
    }
}

//x1vjfegm

//automatically reapply correct background when chat is changed
document.addEventListener('click', (event) => {
    let parentElement = event.target.parentElement;

    while (parentElement && !parentElement.classList.contains('_ak72')) { //traverse DOM tree to find chat container
        parentElement = parentElement.parentElement;
    }
    if (parentElement) { //on click of chat container, apply background
        const chatID = getChatUniqueID();
        if (chatID) {
            setbackground(chatID);
        }
    }
});

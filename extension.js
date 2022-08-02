var graphName = window.roamAlphaAPI.graph.name;
var recentLinksDiv, toggleButton, toggleDiv, topBarDiv;
var urlArray = [];      // array of strings that holds the UIDs of breadcrumbs
var linksArray = [];    // holds array of html strings, <a> link elements, to be displayed in top bar
var crumbsOn = true;    // toggle to display/track breadcrumbs
var linksToTrack = 16;  // number of breadcrumbs to display in top bar

// onload function adds listener for hotkey presses and url hash changes
function onload() {
    window.addEventListener("keyup", hotKeyEvent);
    window.onhashchange = e => setTimeout(addPageToRecent, 250);
    createDivs();
}

// creates divs to hold breadcrumbs, as well as toggle button to turn breadcrumbs on/off
function createDivs() {
    console.log('Roam Breadcrumbs by ✹shodty initialized.')
    //#recentLinks div to hold breadcrumbs
    recentLinksDiv = document.createElement('div');
    recentLinksDiv.id = 'recentLinks';
    //prevent vertical scroll, instead scroll horizontally if top bar is overflowing
    recentLinksDiv.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        recentLinksDiv.scrollLeft += evt.deltaY;
    });
    //put recent links in the topbar div for z-index/positioning purposes
    topBarDiv = document.getElementsByClassName("rm-topbar")[0];
    topBarDiv.appendChild(recentLinksDiv);
    //div + button to stop/start listener, & show/hide breadcrumbs
    toggleDiv = document.createElement('div');
    toggleDiv.id = 'closeCrumbs';
    topBarDiv.appendChild(toggleDiv);

    toggleButton = document.createElement("button");
    toggleButton.id = 'toggleButton';
    toggleButton.innerHTML = "‣";
    toggleButton.classList.add("toggledOn");
    toggleDiv.appendChild(toggleButton);
    toggleButton.onclick = toggleCrumbs;
    //add current url as first breadcrumb
    addPageToRecent();
}

//this function flips the toggle switch, then shows/hides the breadcrumbs. recent links will stop being tracked/displayed.
function toggleCrumbs() {
    crumbsOn = !crumbsOn;
    if (!crumbsOn) {
        recentLinksDiv.style.display = 'none';
        toggleButton.classList.remove("toggledOn");
        toggleButton.classList.add("toggledOff");
    } else {
        recentLinksDiv.style.display = 'flex';
        toggleButton.classList.remove("toggledOff");
        toggleButton.classList.add("toggledOn");
    }
}

async function addPageToRecent() {
    //check if breadcrumbs is toggled on
    if (crumbsOn) {
        var pageUrl = '/'; //daily notes page
        if (!checkIfDailyNotes()) {
            pageUrl = await getUid(); //replace pageUrl with page/block uid if not on daily notes page
        }
        if (urlArray.slice(0, linksToTrack).includes(pageUrl) == false) { //checks if the link already exists in the last 16 links
            createLinkElement(pageUrl);
        }
        else {
            var index = urlArray.indexOf(pageUrl);
            urlArray.splice(index, 1);
            linksArray.splice(index, 1);
            createLinkElement(pageUrl);
        }
    }
}

function createLinkElement(pageUrl) {
    var innerChild, linkElement;
    var blockType = checkBlockType(pageUrl).type;

    // checks if current page is daily notes, a page, or a focused block. creates a name string to place inside <a> link element
    if (checkIfDailyNotes()) { var innerChild = "<span id='dailyIcon'>✹</span> Daily Notes" }
    else if (blockType == 'page') { innerChild = getPageName(pageUrl).substring(0, 25) }
    else if (blockType == 'block') { innerChild = "<span id='focusedIcon'>🞇</span> " + getPageName(pageUrl).substring(0, 20) }
    //add <a> element to array, with unique id and click function that prevents hijacks default navigation and uses openLink/openDaily functions instead
    if (!checkIfDailyNotes()) {
        linkElement = "<a id='" + pageUrl + "'href='javascript:;' class='recentLink' onclick='openLink(event);return false;'>" + innerChild + "</a>";
    }
    else {
        linkElement = "<a id='daily-notes' 'href='javascript:;' class='recentLink' onclick='openDaily();return false;'>" + innerChild + "</a>";
    }
    //unshift adds most recent element to beginning of respective arrays
    urlArray.unshift(pageUrl);  
    linksArray.unshift(linkElement);
    //reduces the array of recent links to be displayed to number of links set at the top in linkToTrack variable
    linksArray = linksArray.slice(0, linksToTrack);
    //puts the <a> array into the recentLinksDiv
    recentLinksDiv.innerHTML = linksArray.slice(0, linksToTrack).join("‣"); 
    var linkElements = document.getElementsByClassName("recentLink");
    //adds index number into the html of each breadcrumb displayed for ease of hotkey reference
    for(i=0; i<linkElements.length; i++){
        var linkNumber = "<span class='linkNumber'>" + i.toString() + "</span>";
        linkElements[i].innerHTML = linkNumber + linkElements[i].innerHTML;
    }
}

//function referenced in the onclick for all <a> breadcrumb elements in the top bar except daily notes, see openDaily()
function openLink(ev) {
    //open link in right sidebar using Roam API if user ctrl+clicks link
    if (ev.ctrlKey == true) {
        window.roamAlphaAPI.ui.rightSidebar.addWindow({ window: { type: 'outline', 'block-uid': ev.srcElement.id } });
    }
    //open link in main window using Roam API if user clicks link
    else {
        window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid: ev.srcElement.id } });
    }
}

//function referenced in the onclick for 'daily notes' <a> breadcrumb element
async function openDaily() {
    await window.roamAlphaAPI.ui.mainWindow.openDailyNotes()
}

//hotkeys for jumping to breadcrumbs, ctrl or alt modifier can be used, + the breadcrumb index
function hotKeyEvent(zEvent) {
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "1") { goToLink(1); }
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "2") { goToLink(2); }
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "3") { goToLink(3); }
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "4") { goToLink(4); }
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "5") { goToLink(5); }
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "6") { goToLink(6); }
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "7") { goToLink(7); }
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "8") { goToLink(8); }
    if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === "9") { goToLink(9); }
}

async function goToLink(n) {
    var linkToClick = urlArray[n];
    // check if link is to the daily notes page, then call appropriate API function to navigate
    if (linkToClick == '/') { await window.roamAlphaAPI.ui.mainWindow.openDailyNotes(); }
    else if (linkToClick != null) { window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid: urlArray[n] } }); }
}

async function getUid() {
    return await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
}

//checks if uid is for a page or a focused block, returns a string stating type 'page' or 'block', as well as the block object with all attributes
function checkBlockType(uid) {
    var block = window.roamAlphaAPI.data.pull("[*]", [":block/uid", uid]);
    if (block.hasOwnProperty(":node/title")) { return { type: 'page', block: block } }
    else if (block.hasOwnProperty(":block/string")) { return { type: 'block', block: block } }
    else return 'shodty error'
}

//gets string from block attributes, either the page title if page, or the block contents if focused block
function getPageName(uid) {
    var name;
    var block = checkBlockType(uid);
    if (block.type == 'page') { name = block.block[":node/title"]; }
    else if (block.type == 'block') { name = block.block[":block/string"] }
    return name;
}

function checkIfDailyNotes() {
    return (graphName == window.location.href.substring(window.location.href.length - graphName.length));
}

//remove listeners and remove html elements added to the dom
function onunload() {
	window.removeEventListener("keyup", hotKeyEvent);
    var elem = document.querySelector('#recentLinks');
    var btn = document.querySelector('#closeCrumbs');
  	if(elem != null) { elem.parentNode.removeChild(elem); }
    if(btn != null) { btn.parentNode.removeChild(btn); }
}


export default {
    onload,
    onunload
  };
/*****************************************/
/*        Blockcrumbs by ✹shodty        */
/*                v1.03                  */
/*****************************************/

var graphName,
  graphURL,
  recentLinksDiv,
  toggleButton,
  toggleDiv,
  topBarDiv,
  sidebarCheck,
  barMaxWidth,
  barMinWidth;
var urlArray = []; // array of strings that holds the UIDs of breadcrumbs
var linksArray = []; // holds array of html strings, <a> link elements, to be displayed in top bar
var crumbsOn = true; // toggle to display/track breadcrumbs
var linksToTrack = 16; // number of breadcrumbs to display in top bar

// actions that are predefined save there state automatically (except button) underneath the id provided for the action
// custom actions can save state with extensionAPI.settings.set / get / getAll
const panelConfig = {
  tabTitle: "Blockcrumbs",
  settings: [
    {
      id: "total-breadcrumbs",
      name: "Total Breadcrumbs",
      description: "The maximum number of links tracked in the breadcrumbs bar",
      action: {
        type: "select",
        items: [5, 10, 15, 25, 50, 100],
        onChange: (evt) => {
          linksToTrack = evt + 1;
          displayLinks();
        },
      },
    },
    {
      id: "bar-max-width",
      name: "Top Bar Width Max",
      description:
        "The width of the breadcrumbs bar when the right side panel is closed.",
      action: {
        type: "select",
        items: [
          "65%",
          "10%",
          "20%",
          "30%",
          "40%",
          "50%",
          "60%",
          "70%",
          "80%",
          "90%",
          "100%",
        ],
        onChange: (evt) => {
          barMaxWidth = evt;
        },
      },
    },
    {
      id: "bar-min-width",
      name: "Top Bar Width Min",
      description:
        "The width of the breadcrumbs bar when the right side panel is open.",
      action: {
        type: "select",
        items: [
          "35%",
          "10%",
          "20%",
          "30%",
          "40%",
          "50%",
          "60%",
          "70%",
          "80%",
          "90%",
          "100%",
        ],
        onChange: (evt) => {
          barMinWidth = evt;
        },
      },
    },
  ],
};

// onload function adds listener for hotkey presses and url hash changes
function onload({ extensionAPI }) {
  //onunload();
  linksToTrack = extensionAPI.settings.get("total-breadcrumbs");
  barMaxWidth = extensionAPI.settings.get("bar-max-width");
  barMinWidth = extensionAPI.settings.get("bar-min-width");
  extensionAPI.settings.panel.create(panelConfig);
  if (linksToTrack == null) {
    linksToTrack = 16;
    extensionAPI.settings.set("total-breadcrumbs", linksToTrack);
  }
  if (barMaxWidth == null) {
    barMaxWidth = "65%";
    extensionAPI.settings.set("bar-max-width", barMaxWidth);
  }
  if (barMinWidth == null) {
    barMinWidth = "35";
    extensionAPI.settings.set("bar-min-width", barMinWidth);
  }
  //temporary fix to adjust bar width if sidebar open/closed
  sidebarCheck = setInterval(checkSidebar, 1000);
  graphName = window.roamAlphaAPI.graph.name;
  graphURL = setGraphUrl();
  window.addEventListener("keyup", hotKeyEvent);
  window.onhashchange = (e) => setTimeout(addPageToRecent, 250);
  createDivs();
}

function setGraphUrl() {
  if (window.roamAlphaAPI.graph.type === "offline") {
    return "https://roamresearch.com/#/offline/" + graphName;
  } else {
    return "https://roamresearch.com/#/app/" + graphName;
  }
}

// creates divs to hold breadcrumbs, as well as toggle button to turn breadcrumbs on/off
function createDivs() {
  console.log(
    "%cRoam Breadcrumbs by %c✹%cshodty %cinitialized.",
    "color: gray;",
    "color: orangered;",
    "color: white; font-style:italic;",
    "color: gray;"
  );
  //#recentLinks div to hold breadcrumbs
  recentLinksDiv = document.createElement("div");
  recentLinksDiv.id = "recentLinks";
  //prevent vertical scroll, instead scroll horizontally if top bar is overflowing
  recentLinksDiv.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    recentLinksDiv.scrollLeft += evt.deltaY;
  });
  //put recent links in the topbar div for z-index/positioning purposes
  topBarDiv = document.getElementsByClassName("rm-topbar")[0];
  topBarDiv.appendChild(recentLinksDiv);
  //div + button to stop/start listener, & show/hide breadcrumbs
  toggleDiv = document.createElement("div");
  toggleDiv.id = "closeCrumbs";
  topBarDiv.appendChild(toggleDiv);

  toggleButton = document.createElement("button");
  toggleButton.id = "toggleButton";
  toggleButton.innerHTML = "🠶";
  toggleButton.classList.add("toggledOn");
  toggleDiv.appendChild(toggleButton);
  toggleButton.onclick = toggleCrumbs;
  toggleButton.onmouseover = mouseOverToggle;
  toggleButton.onmouseleave = mouseLeaveToggle;
  //add current url as first breadcrumb
  addPageToRecent();
}

//this function flips the toggle switch, then shows/hides the breadcrumbs. recent links will stop being tracked/displayed.
function toggleCrumbs(ev) {
  if (ev.shiftKey == true) {
    urlArray = [];
    linksArray = [];
    addPageToRecent();
  } else {
    crumbsOn = !crumbsOn;
    if (!crumbsOn) {
      recentLinksDiv.style.display = "none";
      toggleButton.classList.remove("toggledOn");
      toggleButton.classList.add("toggledOff");
    } else {
      recentLinksDiv.style.display = "flex";
      toggleButton.classList.remove("toggledOff");
      toggleButton.classList.add("toggledOn");
    }
  }
}

async function addPageToRecent() {
  //check if breadcrumbs is toggled on
  if (crumbsOn) {
    let pageUrl;
    if (checkIfDailyNotes()) {
      pageUrl = "/";
    } else if (checkIfGraph()) {
      pageUrl = "graph";
    } else if (checkIfSearch()) {
      pageUrl = "search";
    }
    //replace pageUrl with page/block uid if not on daily notes, graph, or search page
    else {
      pageUrl = await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
    }
    if (urlArray.slice(0, linksToTrack).includes(pageUrl) == false) {
      //checks if the link already exists in the last 16 links
      createLinkElement(pageUrl);
    } else {
      //find the index of the page element that already in recents, splice (remove) it from its current index,
      //then call createLinkElement to place it back at the beginning of the list
      var index = urlArray.indexOf(pageUrl);
      urlArray.splice(index, 1);
      linksArray.splice(index, 1);
      createLinkElement(pageUrl);
    }
  }
}

function createLinkElement(pageUrl) {
  let innerChild, linkElement;
  // checks if current page is daily notes, a page, or a focused block. creates a name string to place inside <a> link element
  if (pageUrl == "/") {
    innerChild = "<span id='dailyIcon'>✹</span> Daily Notes";
  } else if (pageUrl == "graph") {
    innerChild = "<span id='graphIcon'>🕸️</span> Graph";
  } else if (pageUrl == "search") {
    innerChild = "<span id='searchIcon'>🔎</span> Search";
  } else if (checkBlockType(pageUrl).type == "page") {
    innerChild = getPageName(pageUrl).substring(0, 25);
  } else if (checkBlockType(pageUrl).type == "block") {
    innerChild =
      "<span id='focusedIcon'>🞇</span> " +
      getPageName(pageUrl).substring(0, 20);
  }
  //add <a> element to array, with unique id and click function that prevents hijacks default navigation and uses openLink/openDaily functions instead
  if (pageUrl == "/") {
    linkElement =
      "<a id='daily-notes' class='recentLink'>" + innerChild + "</a>";
  } else if (pageUrl == "graph") {
    linkElement =
      "<a id='graph-crumb' class='recentLink'>" + innerChild + "</a>";
  } else if (pageUrl == "search") {
    linkElement =
      "<a id='search-crumb' class='recentLink'>" + innerChild + "</a>";
  } else {
    linkElement =
      "<a id='" + pageUrl + "' class='recentLink'>" + innerChild + "</a>";
  }

  //unshift adds most recent element to beginning of respective arrays
  urlArray.unshift(pageUrl);
  linksArray.unshift(linkElement);
  displayLinks();
}

//reduce the array of recent links to be displayed to number of links set at the top in linkToTrack variable
function displayLinks() {
  linksArray = linksArray.slice(0, linksToTrack);
  //put all the html from the links array into the recentLinksDiv. this is an array of strings of <a> elements containing a <span>
  recentLinksDiv.innerHTML = linksArray.slice(0, linksToTrack).join("‣");
  numberLinks();
}

//add index number into the html of each breadcrumb displayed for ease of hotkey reference
function numberLinks() {
  let linkElements = document.getElementsByClassName("recentLink");
  for (let i = 0; i < linkElements.length; i++) {
    let linkNumber = "<span class='linkNumber'>" + i.toString() + "</span>";
    let link = linkElements[i];
    link.innerHTML = linkNumber + link.innerHTML;
    if (link.id == "daily-notes") {
      link.onclick = openDaily;
    } else if (link.id == "graph-crumb") {
      link.onclick = openGraph;
    } else if (link.id == "search-crumb") {
      link.onclick = openSearch;
    } else {
      link.onclick = openLink;
    }
  }
}

//function referenced in the onclick for all <a> breadcrumb elements in the top bar except daily notes, see openDaily()
function openLink(ev) {
  //open link in right sidebar using Roam API if user shift+clicks link
  if (ev.shiftKey == true) {
    window.roamAlphaAPI.ui.rightSidebar.addWindow({
      window: { type: "outline", "block-uid": ev.srcElement.id },
    });
  }
  //open link in main window using Roam API if user clicks link
  else {
    window.roamAlphaAPI.ui.mainWindow.openPage({
      page: { uid: ev.srcElement.id },
    });
  }
}

//function referenced in the onclick for 'daily notes' <a> breadcrumb element
async function openDaily() {
  await window.roamAlphaAPI.ui.mainWindow.openDailyNotes();
}

function openGraph() {
  location.href = graphURL + "/graph";
}

function openSearch() {
  location.href = graphURL + "/search";
}

//hotkeys for jumping to breadcrumbs, ctrl or alt modifier can be used, + the breadcrumb index
function hotKeyEvent(zEvent) {
  //first make sure ctrl + alt aren't being pressed simultaneously, as this could mean the user is trying to use the 'make heading' default roam shortcut.
  //if not, then use hotkey press to navigate to appropriate link index
  if (!(zEvent.altKey && zEvent.ctrlKey)) {
    for (let i = 0; i < 10; i++) {
      if ((zEvent.altKey || zEvent.ctrlKey) && zEvent.key === i.toString()) {
        goToLink(i);
      }
    }
  }
}

async function goToLink(n) {
  let linkToClick = urlArray[n];
  // check if link is to the daily notes, graph, search, or block/page, then call appropriate function to navigate
  if (linkToClick == "/") {
    await openDaily();
  } else if (linkToClick == "graph") {
    openGraph();
  } else if (linkToClick == "search") {
    openSearch();
  } else if (linkToClick != null) {
    window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid: urlArray[n] } });
  }
}

//checks if uid is for a page or a focused block, returns a string stating type 'page' or 'block', as well as the block object with all attributes
function checkBlockType(uid) {
  let block = window.roamAlphaAPI.data.pull("[*]", [":block/uid", uid]);
  if (block.hasOwnProperty(":node/title")) {
    return { type: "page", block: block };
  } else if (block.hasOwnProperty(":block/string")) {
    return { type: "block", block: block };
  } else return "shodty error";
}

//gets string from block attributes, either the page title if page, or the block contents if focused block
function getPageName(uid) {
  let name;
  let block = checkBlockType(uid);
  if (block.type == "page") {
    name = block.block[":node/title"];
  } else if (block.type == "block") {
    name = block.block[":block/string"];
  }
  return name;
}

function checkIfDailyNotes() {
  return (
    graphName ==
    window.location.href.substring(
      window.location.href.length - graphName.length
    )
  );
}

function checkIfGraph() {
  return (
    "graph" == window.location.href.substring(window.location.href.length - 5)
  );
}

function checkIfSearch() {
  return (
    "search" == window.location.href.substring(window.location.href.length - 6)
  );
}

function checkSidebar() {
  let sidebarHandle = document.getElementsByClassName("rm-resize-handle");
  if (sidebarHandle[0] == null) {
    recentLinksDiv.style.width = barMaxWidth;
  } else if (sidebarHandle[0] != null) {
    recentLinksDiv.style.width = barMinWidth;
  }
}

function mouseOverToggle(ev) {
  if (ev.shiftKey == true) ev.srcElement.style.color = "#0087FF";
  else ev.srcElement.style.removeProperty("color");
}

function mouseLeaveToggle(ev) {
  ev.srcElement.style.removeProperty("color");
}

//remove listeners and remove html elements added to the dom
function onunload() {
  clearInterval(sidebarCheck);
  urlArray = [];
  linksArray = [];
  window.removeEventListener("keyup", hotKeyEvent);
  let elem = document.querySelector("#recentLinks");
  let btn = document.querySelector("#closeCrumbs");
  if (elem != null) {
    elem.parentNode.removeChild(elem);
  }
  if (btn != null) {
    btn.parentNode.removeChild(btn);
  }
}

export default {
  onload: onload,
  onunload: onunload,
};

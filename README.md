# roam-breadcrumbs
by <img src="https://user-images.githubusercontent.com/32799489/182765779-b0ca1c44-a272-4bbd-b85e-71fdb25ee39d.png"></img>


_v1.02_
A simple Roam Research extension that displays and numbers your recent page and block visits in a bar along the top of your graph for easy recall.


_This extension can be installed using Roam Depot. It does not manipulate your notes in any way._

### How to use:
    Click green arrow (‣):                    Turns breadcrumb display on/off
    Click breadcrumb:                         Open page/block in main window
    Shift + Click breadcrumb:                 Open page/block in right sidebar
    Ctrl + number (Ctrl + 1, Ctrl + 2, etc):  Hotkey to open link in main window
    Alt  + number (Alt + 1, Alt + 2, etc):    Hotkey to open link in main window

Vanilla styling:
<img src="https://user-images.githubusercontent.com/32799489/182746482-64135da4-5829-4748-b34b-2c2b22347895.png"></img>

Styled with [Dark Age](https://github.com/shodty/Roam_Dark_Age):
<img src="https://user-images.githubusercontent.com/32799489/182746108-79d69971-f3a5-4423-ac9d-8183db60dd5f.png"></img>


Index 0 is your current page. If you revisit the a page that is already in your recents, it will not duplicate that page in your recents, but instead move it to index 0.

The top bar has a max width, but when it overflows, it is horizontally scrollable using the mousewheel. Currently, the extension displays your last 15 page/block visits. 

- If recent visit is a page, the recent link will display as that page's title, truncated to 25 characters.
- If recent visit is your Daily Notes, the recent link will display as "Daily Notes", prefixed with an orange ✹.
- If recent visit is your Graph Overview, the recent link will display as "Graph", prefixed with 🕸️.
- If recent visit is your All Pages, the recent link will display as "Search", prefixed with 🔎.
- If recent visit is a focused block, the recent link will display as that block's content, truncated to 20 characters and prefixed with a blue 🞇.


### Demo:

<video src="https://user-images.githubusercontent.com/32799489/182495797-b5535d75-81ed-4238-be57-e970d5c02a6f.mp4" controls="controls"></video>

CSS to target if manually styling:
`#recentLinks`
`#closeCrumbs`
`#toggleButton`
`#dailyIcon`
`#focusedIcon`
`.recentLink`
`.linkNumber`
`.toggledOn`
`.toggledOff`

## Roadmap

- make the options configurable by the user, namely:
  * adjust the number of recent links displayed in top bar
  * better top bar width control so as not to interfere with other top bar elements
  * change placement/layout of the recent links display (left sidebar?)
  * customizable hotkeys to trigger links
  * customizable styling for the top bar
- add ability to open links in sidebar using hotkeys only (no clicks)
- add button for clearing recents completely
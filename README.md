# roam-breadcrumbs

A simple Roam Research extension that displays and numbers your recent page and block visits in a bar along the top of your graph.

__This extension can be installed using Roam Depot. It does not manipulate your notes in any way.__

### How to use:
    - Click green arrow (‣):                    Turns breadcrumb display on/off
    - Click link:                               Open page/block in main window
    - Ctrl + Click link:                        Open page/block in right sidebar
    - Ctrl + number (Ctrl + 1, Ctrl + 2, etc):  Hotkey to open link in main window
    - Alt  + number (Alt + 1, Alt + 2, etc):    Hotkey to open link in main window

Index 0 is your current page. If you revisit the a page that is already in your recents, it will not duplicate that page in your recents, but instead move it to index 0.

The top bar has a max width, but when it overflows, it is horizontally scrollable using the mousewheel. Currently, the extension displays your last 15 page/block visits. 

- If recent visit is a page, the recent link will display as that page's title, truncated to 25 characters.
- If recent visit is your daily notes, the recent link will display as "Daily Notes", prefixed with an orange ✹.
- If recent visit is a focused block, the recent link will display as that block's content, truncated to 20 characters and prefixed with a blue 🞇.

### Demo:

__COMING SOON__

CSS to target if manually styling:
`#recentLinks`
`#closeCrumbs`
`#toggleButton`
`.recentLink`
`.linkNumber`

## Roadmap

- make the options configurable by the user, namely:
  * adjust the number of recent links displayed in top bar
  * change placement/layout of the recent links display (left sidebar?)
  * customizable hotkeys to trigger links
  * customizable styling for the top bar
- add ability to open links in sidebar using hotkeys only (no clicks)
- add button for clearing recents completely
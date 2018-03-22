# Psycho Bubbles

**What is this?**

This project is basically a showcase of shaders I've made or messed around with while playing with [A-Frame](https://aframe.io). 

It is built to show off the full capabilities of shaders in VR, and so will probably melt any mobile device (not really, but the framerate will be awful). If you'd like to see a mobile visualizer, try [Opal](https://opal.glitch.me/).

You can select one of the bubbles for a cool visualization (more info can be found in each bubble) or simply enjoy the view from the menu.

**Questions? Comments? Bugs? Job Offers? Cool Links? Angry Rants?**
- Email:  *algoraphics@gmail.com*
- Twitter:  [@algoraphics](https://twitter.com/algoraphics)

**Setup**

*PC VR:*
1. Have Firefox 10, or another browser which [supports A-Frame VR.](https://aframe.io/docs/0.7.0/introduction/vr-headsets-and-webvr-browsers.html)
2. *Make sure your VR supported browser is closed.* Not always necessary, but helps to prevent issues.
3. Start your VR headset (Boot up SteamVR, open Oculus Home, etc)
4. Open WebVR supported browser and load up [Psycho-Bubbles](https://psycho-bubbles.glitch.me/).
5. Hit the button in the bottom-right corner to enter VR. Put on your headset.

*2D:*
1. Open a browser which [supports A-Frame.](https://aframe.io/docs/0.7.0/introduction/vr-headsets-and-webvr-browsers.html#which-browsers-does-a-frame-support)
2. Load up [Psycho-Bubbles](https://psycho-bubbles.glitch.me/).

**Where can it run?**

Theoretically, it should work on Rift, Windows MR, etc, as long as you follow [A-Frame conventions for getting WebVR to run.](https://aframe.io/docs/0.7.0/introduction/vr-headsets-and-webvr-browsers.html)

List of devices on which this is confirmed to work:
- Vive running with Firefox 10 on Windows 10
- Google Chrome on Windows 10
- Google Chrome on Ubuntu
- Google Chrome on iOS
- Safari on iOS
- Firefox 10 on Windows 10

**Troubleshooting/FAQ:**

- Refreshing the page will fix many problems:
  - Buttons out of place/missing, not responding to click/touch/hover, etc.
  - Seems like not everything has loaded (sky is white, main menu is missing, etc.)
- I'm in a colorful bubble and I don't see any buttons! What do?
  - Look down. The info menu might be minimized, and the toggle button is below you.
- The screen is just...white.
  - Are you on a mobile device, or computer with a weak graphics card? You may not be able to run this page.
  - If you're unsure, check if your browser [supports A-Frame.](https://aframe.io/docs/0.7.0/introduction/vr-headsets-and-webvr-browsers.html#which-browsers-does-a-frame-support)
- Vive issues:
  - Cannot start SteamVR (app running):
    - Find your browser and call end process on it. Restart SteamVR.
    - If unsuccessful, close browsers and restart Steam.
    - Open browsers only after SteamVR has started up again.
  - Loading forever (from within VR, even if display shows up on desktop):
    - Refresh page and try again.
    - If this does not work, close browser window, reboot SteamVR, and re-open window.
- Performance:
  - Displaying the webpage on both your VR headset and desktop will hurt performance. Minimize the window on desktop or open another random tab instead.
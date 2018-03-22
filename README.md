# Opal

**What is this?**

This is a showcase of a shader I found and updated, made with [A-Frame](https://aframe.io).

I think it's at its coolest if you put on some music, sit back, relax, and watch it play.

This page has been kept simple so that the maximum number of devices are supported. If you've got a powerful PC and want to see some more visualizations, check out [Psycho-Bubbles](https://psycho-bubbles.glitch.me/).

**Questions? Comments? Bugs? Job Offers? Cool Links? Angry Rants?**
- Email:  *algoraphics@gmail.com*
- Twitter:  [@algoraphics](https://twitter.com/algoraphics)

**Keyboard Controls**
- Q/E : Move time forward/backward
- Z/X : Zoom in/out
- C/V : Shatter/Reverse
- N/M : Twist/Reverse
- B : Undo all Shatter and Twist

**Setup**

*Mobile*
1. Open [Opal](https://opal.glitch.me/).
2. If you have mobile VR, turn device sideways and insert into VR headset.

*PC VR:*
1. Have Firefox 10, or another browser which [supports A-Frame VR.](https://aframe.io/docs/0.7.0/introduction/vr-headsets-and-webvr-browsers.html)
2. *Make sure your VR supported browser is closed.* Not always necessary, but helps to prevent issues.
3. Start your VR headset (Boot up SteamVR, open Oculus Home, etc)
4. Open WebVR supported browser and load up [Opal](https://opal.glitch.me/).
5. Hit the button in the bottom-right corner to enter VR. Put on your headset.

*2D:*
1. Open a browser which [supports A-Frame.](https://aframe.io/docs/0.7.0/introduction/vr-headsets-and-webvr-browsers.html#which-browsers-does-a-frame-support)
2. Load up [Opal](https://opal.glitch.me/).

**Where Can It Run?**

Theoretically, it should work on Rift, and any VR-ready mobile phone as long as you follow [A-Frame conventions for getting WebVR to run.](https://aframe.io/docs/0.7.0/introduction/vr-headsets-and-webvr-browsers.html)

Confirmed Working:
- Vive running with Firefox 10 on Windows 10
- Iphone 8, 7, 6, SE
- Samsung Galaxy S9
- Google Chrome on Windows 10
- Google Chrome on Ubuntu
- Google Chrome on iOS
- Safari on iOS
- Firefox 10 on Windows 10

Confirmed Not Working (low framerate)
- Moto Z Play
- Samsung Galaxy S6

**Troubleshooting/FAQ:**

- It still seems to be loading and the framerate is awful!
  - On some phones (e.g. iPhone 6 and 7) there is a long loading period, after which it will run smoothly.
- The framerate is awful and it's done loading!
  - Check
- Screen is white, it doesn't seem to be loading
  - Make sure your browser [supports A-Frame.](https://aframe.io/docs/0.7.0/introduction/vr-headsets-and-webvr-browsers.html#which-browsers-does-a-frame-support)
- Vive issues:
  - Cannot start SteamVR (app running):
    - Find your browser and call end process on it. Restart SteamVR.
    - If unsuccessful, close browsers and restart Steam.
    - Open browsers only after SteamVR has started up again.
  - Loading forever (from within VR, even if display shows up on desktop):
    - Refresh page and try again.
    - If this does not work, close browser window, reboot SteamVR, and re-open window.
  - Outside of the bubble, or too close to it:
    - Make sure you're in the center of your play space.
  - Performance:
    - Displaying the webpage on both your VR headset and desktop will hurt performance. Minimize the window on desktop or open another random tab instead.
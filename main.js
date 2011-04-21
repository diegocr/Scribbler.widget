// JavaScript Document
// preferences.PrefValues.value = "0|0|20|0|0|0|0|0|0|0|0";
// preferences.ScribEntries.value = "Ghehehe@Kokakaka";
// preferences.PinEntries.value = "";

/*

v3.0 beta 4

todo:
1. quick view active scrib (pop-up)? [done -> beta 5]

change list:
1. Added a custom escape and unescape function
2. Added possibility to display program and file icons
3. Added drag & drop support
4. Added completely dynamic coloring options
5. Added ability to move scribblings in the list
6. Added a bug reporting option

7. Fixed problem with adding paths and special characters
8. Fixed a bug with the contextmenus
9. Fixed a VERY nasty bug with \f\r\n\t\v characters on the clipboard


v3.0 beta 5

todo:
1. Alter the about-box [done -> beta 5]
2. Update help section

change list:
1. Added a popup function for the active scribbling
2. Added a preference for the popup orientation on the screen
3. Added a search function for some major search engines
4. Added delete images for people who don't want to access the contectmenu ;-)

5. Changed some minor interface items
6. Changed a lot of code to make it more efficient

7. Fixed a problem with Y!WE crashing and using dynamic contextmenu's. Fixed a small bug concerning escaping / unescaping
8. Fixed a problem with pinned scribblings
9. Fixed a problem with the helpwindow reappearing after saving the preferences


v3.0 beta 6

todo:
1. Code cleanup [done -> beta 6]
2. Update help section
3. Make the pinned index attached to the scrib? [rejected -> beta 6]
4. Make custom hover images... [busy -> beta 6]

5. Added font options for the interface + scribblings (still developing) [bug in Y!WE with localized fonts!]
6. Added a Timer object instead of hardcoding an action in the widget
7. Added an option to enable/disable shadows for scribblings
8. Added option to scroll scribblings
9. Added a colorize option (color-picker!)
10. Added custom tooltips!

10. Changed a lot of code for optimization.
11. Replaced most 'for' loops with 'while' loops (much faster)
12. Replaced a lot of if...then...else... statements for 'switch' statements (much faster)
13. Optimized most loops and conditions
14. Changed the click handling... specials now open when clicking the icon and copy when clicking the text
15. Changed the ticklabels in the coloring dialog to be more clear

16. Fixed a problem with dropping scribblings
17. Fixed a problem with pinned scribblings
18. Fixed a problem with the current active scribbling
19. Fixed a bug with reverse adding

v3.0 beta 8

1. Added custom color prefs (sweet)
2. Fixed some minor bugs


v5.0 - 20090909 - Diego Casorran <dcasorran@gmail.com>

1. bugfix: keep selected the last entry while droping
2. bugfix: replaced customEncode/Decode's internals to use base64 routines with UTF-8 Support
3. fixed all occurences of scribArray to use customEncode/Decode when data needs to be shown to the user
4. checkNewScrib() will check now the size of the clipboard before trying to add it, being 96Kb max, otherwise could be quite slow...
5. limitted the strings length to be show on pop and pop's tooltips. while it's automatically done, this should reduce the mem usage(?)
6. Changed scribDelimiter from ||__|| to @

*/

var activeColor;
var hoverColor;
var shadowColor;
var useShadows;
var actionOnMax;
var reverseAdd;
var useBg;
var defaultSubject;
var useIcons;
var sizeIcons;
var popUpArea;
var hideControls;
var scrollScribs;
var alertSnap;
var alertClear;
var interfaceFont;
var interfaceFontColor;
var scribFont;
var scribFontColor;
var bgOpacity;
var popUpCenter;
var tooltipTime;

var isPressed = 0;
var helpNum = 0;
var pinIndex = 0;
var isRound = 0;

var s = new Shadow();
var hotKey = new HotKey();
var hotKey2 = new HotKey();
var hoverTimer = new Timer();

var currentClipBoard = system.clipboard;

var preferenceArray = new Array();
var scribArray = new Array();
var toggleArray = new Array(0,1,2,3,4,5);
var pinArray = new Array();
var bgAr = new Array();
var txtAr = new Array();
var imgAr = new Array();
var delAr = new Array();
var helpDataArray = new Array();

var arrayDelimiter = "|";
var scribDelimiter = "@";
var snapDelimiter = ":";

var checkTimer = new Timer();
checkTimer.interval = 1;
checkTimer.ticking = false;
checkTimer.onTimerFired = 'checkNewScrib();';


function getPreferenceArray() {
  var tmp = preferences.PinEntries.value; 
  if (tmp != "") {
    pinArray = tmp.split(arrayDelimiter);
  }
  preferenceArray = preferences.PrefValues.value.split(arrayDelimiter);
  var prefAr = Array("TooltipTime","PopUpCenter","ActiveColor","HoverColor","UseShadows","ShadowColor","ActionOnMax","ReverseAdd","UseBG","BgOpacity","HideControls","ScrollScribs","AlertSnap","AlertClear","HotKeySeq","HotKeySeq2","PopUpArea","DefaultSubject","UseIcons","SizeIcons","InterfaceFont","InterfaceFontColor","ScribFont","ScribFontColor");
  var pref2Ar = Array("tooltipTime","popUpCenter","activeColor","hoverColor","useShadows","shadowColor","actionOnMax","reverseAdd","useBg","bgOpacity","hideControls","scrollScribs","alertSnap","alertClear","hotKeySeq","hotKeySeq2","popUpArea","defaultSubject","useIcons","sizeIcons","interfaceFont","interfaceFontColor","scribFont","scribFontColor");
  var i=0;
  var l=prefAr.length;
  
  while (i<l) {
    eval(pref2Ar[i]+" = preferences."+prefAr[i]+".value");
    ++i;
  }
  checkTimer.ticking = ((preferenceArray[3] == 1) ? true : false);
}

function savePreferenceArray() {
  preferences.PrefValues.value = preferenceArray.join(arrayDelimiter);
  preferences.PinEntries.value = pinArray.join(arrayDelimiter);
  checkTimer.ticking = ((preferenceArray[3] == 1) ? true : false);
}

function getScribArray() {
  if (preferences.ScribEntries.value != "") {
    scribArray = preferences.ScribEntries.value.split(scribDelimiter);
  }
}

function saveScribArray() {
  preferences.ScribEntries.value = scribArray.join(scribDelimiter);
  NumActiveScrib.data = scribArray.length;
}

function getHotKey() {
  var t = hotKeySeq.split("+");
  var l = t.length;
  
  hotKey.key = t[l-1];
  t.pop();
  hotKey.modifier = t.join("+");
  hotKey.onKeyDown = 'popUp();';
  
  t = hotKeySeq2.split("+");
  l = t.length;
  hotKey2.key = t[l-1];
  t.pop();
  hotKey2.modifier = t.join("+");
  hotKey2.onKeyDown = 'popScrib();';
}

function toggleShowAll() {
  preferenceArray[0] = ( (preferenceArray[0] == "0") ? "1" : "0" );
  savePreferenceArray();
  reDraw(0);
}

function toggleAutoAdd() {
  preferenceArray[3] = ( (preferenceArray[3] == "0") ? "1" : "0" );
  savePreferenceArray();
  reDraw(3);
}

function toggleCheckDup() {
  preferenceArray[4] = ( (preferenceArray[4] == "0") ? "1" : "0" );
  savePreferenceArray();
  reDraw(4);
}

function toggleCheckUrl() {
  var pref = preferenceArray[0];
  
  if (pref == 1) {
    clearList();
  }
  preferenceArray[5] = ( (preferenceArray[5] == "0") ? "1" : "0" );
  savePreferenceArray();
  reDraw(5);
  if (pref == 1) {
    drawList();
  }
}

function toggleMode(x) {
  var pref = preferenceArray[0];
  var opac = ModeImage.opacity;
  
  switch(x) {
    case 0:
      if (pref == 1) {
        ModeText.data = "copy / open";
        if (opac > 0) {
          ModeImage.fade(255,0,2);
        }
      }
      break;
    case 1:
      if (pref == 1) {
        ModeText.data = "patch";
        ModeImage.src = "Resources/Images/pm_text.png";
        ModeImage.fade(0,255,2);
      }
      break;
    case 2:
      if (pref == 1) {
        ModeText.data = "cut";
        ModeImage.src = "Resources/Images/cm_text.png";
        ModeImage.fade(0,255,2);
      }
      break;
    case 3:
      if (pref == 1) {
        ModeText.data = "force copy";
        ModeImage.src = "Resources/Images/fcm_text.png";
        ModeImage.fade(0,255,2);
      }
      break;
    case 4:
      if (pref == 1) {
        ModeText.data = "paste";
        ModeImage.src = "Resources/Images/ptm_text.png";
        ModeImage.fade(0,255,2);
      }
      break;
    case 5:
      ModeText.data = "drag & drop";
      break;
  }
}

function setMaxScribs() {
  var s = scribArray.length;
  var pref = preferenceArray[0];
  var result = parseInt(prompt("Maximum:", NumMaxScrib.data.substr(2), "Maximum number of scribblings", "Set", "Cancel"));
  
  if (result) {
    if (result < 1) {
      alert("The maximum number of scribblings can not be less than 1!");
      return;
    }
    if (result < s) {
      var dropScrib = alert("You have "+scribArray.length+" scribblings in your list, reducing the maximum amount of scribblings will drop "+(scribArray.length - parseInt(result))+" scribbling(s). Do you want to continue?","Yes","No");
      if (dropScrib == 1) {
        if (pref == 1) {
          clearList();
        }
        switch (reverseAdd) {
          case 1:
            scribArray.splice(result);
            break;
          default:
            scribArray.splice(0,(scribArray.length - result));
            break;
        }
        saveScribArray();
        if (pref == 1) {
          drawList();
        }
      }
    }
    preferenceArray[2] = result;
    savePreferenceArray();
    reDraw(2);
  }
}

function saveSnapShot() {
  var snapX = MainWindow.hOffset;
  var snapY = MainWindow.vOffset;
  
  preferenceArray[1] = snapX + snapDelimiter + snapY;
  if (alertSnap == 1) {
    alert("Snapshot saved!");
  }
  savePreferenceArray();
}

function restoreSnapShot() {
  var snaps = preferenceArray[1].split(snapDelimiter);
  var snapX = snaps[0];
  var snapY = snaps[1];
  
  MainWindow.moveTo(snapX, snapY, 4);
}

function addScrib(scrib, manual) {
  var i=0;
  var s=scribArray.length;
  var increaseMax = 0;
  var dropOldest = 0;
  var dupFound = 0;
  var pref = preferenceArray[0];
  var pref2 = preferenceArray[2];
  
  if (s == pref2) {
    switch (actionOnMax) {
      case "0":
        return;
        break;
      case "1":
        increaseMax = 1;
        break;
      case "2":
        dropOldest = 1;
        break;
      case "3":
        var result = alert("Your scrib limit ("+preferenceArray[2]+") is reached. Do you still want to add this scribbling and increase the maximum?","Yes","No");
        if (result == 1) {
          increaseMax = 1;
        } else {
          return;
        }
        break;
    }
  }
  var result;
  switch (manual) {
    case 1:
      result = prompt("Entry:", system.clipboard, "Manually add a scribbling", "Add", "Cancel");
      break;
    default:
      result = scrib;
      break;
  }
  if (pref == 1) {
    clearList();
  }
  if (result) {
    result = customEscape(result);
    var pref4 = preferenceArray[4];
    if (pref4 == 1) {
      i=0;
      while (i < s) {
        if (scribArray[i] == result) {
          dupFound = 1;
        }
        ++i;
      }
    }
    if (dupFound == 0) {
      if (dropOldest == 1) {
        writeScrib(result,((reverseAdd == 1) ? 1 : 0 ),1);
      } else {
        writeScrib(result,((reverseAdd == 1) ? 1 : 0 ),0);
        if (increaseMax == 1) {
          preferenceArray[2]++;
          savePreferenceArray();
          reDraw(2);
        }
      }
    }
  }
  if (preferenceArray[0] == 1) {
    drawList();
  }
}

function writeScrib(scrib,reversed,drop) {
  var s=scribArray.length;
  var l=pinArray.length;
  var i=0;
  var c=0;
  
  if (drop == 1) {
    if (reversed == 1) {
      scribArray.pop();
      scribArray.reverse();
      scribArray.push(scrib);
      scribArray.reverse();
      c=0;
      while(c<l) {
        ++pinArray[c];
        if (pinArray[c] > (s-1)) {
          pinArray.pop();
        }
        ++c;
      }
      ++preferenceArray[6];
      if (preferenceArray[6] > s) {
        preferenceArray[6] = 0;
      }
      copyScrib(preferenceArray[6]);
    } else {
      scribArray.reverse();
      scribArray.pop();
      scribArray.reverse();
      scribArray.push(scrib);
      c=0;
      while (c<l) {
        pinArray[c]--;
        if (pinArray[c] < 0) {
          pinArray.splice(0,1);
        }
        ++c;
      }
      preferenceArray[6]--;
      if (preferenceArray[6] < 0) {
        preferenceArray[6] = 0;
      }
      copyScrib(preferenceArray[6]);
    }
  } else {
    if (reversed == 1) {
      c=0;
      while (c<l) {
        ++pinArray[c];
        ++c;
      }
      scribArray.reverse();
      scribArray.push(scrib);
      scribArray.reverse();
      //if (scribArray.length == 1) {
      preferenceArray[6] = 0;
      //} else {
      //  ++preferenceArray[6];
      //}
      copyScrib(0);
    } else {
      scribArray.push(scrib);
      preferenceArray[6] = scribArray.length-1;
      copyScrib(preferenceArray[6]);
      setActiveScrib(preferenceArray[6]);
    }
  }
  s=scribArray.length;
  if (s == 1) {
    copyScrib(0);
    setActiveScrib(0);
  } else if ((s == 20) && drop) { // diegocr's bugfix: keep active the last inserted text - quick&dirty fix!
    s = (reversed ? 0 : 19);
    copyScrib(s);
    setActiveScrib(s);
  }
  saveScribArray();
  savePreferenceArray();
}

function setActiveScrib(x) {
  preferenceArray[6] = x;
  savePreferenceArray();
}

function checkNewScrib() {
  var s=system.clipboard;
  
  if ((currentClipBoard != s) && (s != "undefined") && (s.length < 98304)) {
    currentClipBoard = s;
    addScrib(s,0);
  }
}

function copyScrib(x) {
  system.clipboard = customUnescape(scribArray[x],1);
}

function removeScrib(x) {
  var l=pinArray.length;
  var i=0;
  var check = checkPinned(x);
  var pref6 = preferenceArray[6];
  
  clearList();
  scribArray.splice(x,1);
  if (check) {
    pinArray.splice(pinIndex,1);
  }
  i=0;
  while (i<l) {
    if (pinArray[i] > x) {
      pinArray[i]--;
    }
    ++i;
  }
  if (x < pref6) {
    //preferenceArray[6] += -1;
    setActiveScrib(pref6-1);
  } else if (x == pref6) {
    preferenceArray[6] = ((x > 0) ? (x-1) : 0);
    system.clipboard = customUnescape(scribArray[pref6],2); // diegocr fix
  }
  savePreferenceArray();
  saveScribArray();
  drawList();
}

function clearIt() {
  var item;
  var pref5 = preferenceArray[5];
  
  if (pref5 == 1) {
    for (item in imgAr) {
        imgAr[item].opacity = 0;
    }
  }
  for (item in txtAr) {
      txtAr[item].opacity = 0;
  }
  if (useBg == 1) {
    for (item in bgAr) {
        bgAr[item].opacity = 0;
    }
  }
}

function editScrib(x) {
  var s=customUnescape(scribArray[x],2); // diegocr fix
  var result = prompt("Entry:",s,"Edit the scribbling","Accept","Cancel");
  
  if ((result) && (s != result)) {
    clearList();
    scribArray[x] = customEscape(result); // diegocr fix
    saveScribArray();
    drawList();
  }
}

function pasteScrib(x) {
  var s=system.clipboard;
  
  if (s != "") {
    clearList();
    scribArray[x] = customEscape(s); // diegocr fix
    saveScribArray();
    drawList();
  } else {
    alert("There's nothing to paste!");
  }
}

function pinScrib(x) {
  var pref = preferenceArray[0];
  
  ((checkPinned(x)) ? pinArray.splice(pinIndex,1) : pinArray.push(x));
  if (pref == 1) {
    clearList();
  }
  savePreferenceArray();
  if (pref == 1) {
    drawList();
  }
}

function moveScrib(x,y) {
  var i=0;
  var l=pinArray.length;
  var tmp;
  var pref6 = preferenceArray[6];
  
  clearList();
  if (x == -1) {
    if (pref6 == y) {
      preferenceArray[6] = y-1;
    } else if (pref6 == y-1) {
      preferenceArray[6] = y;
    }
    if (checkPinned(y)) {
      i=0;
      while (i<l) {
        if (pinArray[i] == y) {
          pinArray[i] = y-1;
        }
        ++i;
      }
    } else if (checkPinned(y-1)) {
      i=0;
      while (i<l) {
        if (pinArray[i] == y-1) {
          pinArray[i] = y;
        }
        ++i;
      }
    }
    tmp = scribArray[y-1];
    scribArray[y-1] = scribArray[y];
    scribArray[y] = tmp;
  } else if (x == 1) {
    if (pref6 == y) {
      preferenceArray[6] = y+1;
    } else if (pref6 == y+1) {
      preferenceArray[6] = y;
    }
    if (checkPinned(y)) {
      i=0;
      while (i<l) {
        if (pinArray[i] == y) {
          pinArray[i] = y+1;
        }
        ++i;
      }
    } else if (checkPinned(y+1)) {
      i=0;
      while (i<l) {
        if (pinArray[i] == y+1) {
          pinArray[i] = y;
        }
        ++i;
      }
    }
  
    tmp = scribArray[y+1];
    scribArray[y+1] = scribArray[y];
    scribArray[y] = tmp;
  }
  savePreferenceArray();
  saveScribArray();
  drawList();
}

function clearAll() {
  var isPinned;
  var result;
  var y=0;
  var count = 0;
  var l=pinArray.length;
  var s=scribArray.length;
  var pref = preferenceArray[0];
  
  if (alertClear == 1) {
    result = alert("Are you sure you want to remove all scribblings?","Yes","No");
  } else {
    result = 1;
  }
  if (result == 1) {
    if (pref == 1) {
      clearList();
    }
    var pin = preferences.PinEntries.value;
    if (pin != "") {
      y=0;
      while (y<l) {
        scribArray[y] = scribArray[pinArray[y]];
        ++count;
        ++y;
      }
    }
    y=0;
    while (y<count) {
      pinArray[y] = y;
      ++y;
    }
    scribArray.splice(count,(s-count));
    saveScribArray();
    preferenceArray[6] = 0;
    savePreferenceArray();
    if (pref == 1) {
      drawList();
    }
  }
}

function showHelp() {

  var helpData1 = "Welcome to the help section for Scribbler v5.0!\n\nI will try to guide you through most of the features available in this version of Scribbler.\n\nPlease remember, there's a lot to explore and I can't explain all the details here, so go on and have fun!";
  var helpData2 = "To navigate around the help section, you can use the 'next' and 'previous' buttons in the lower right corner to go to the next or previous page.\n\nClicking the round icon with a slash in it, will quit the help section.\n\nThe numbers in the middle-lower area of the help section tell you at which page you are."
  var helpData3 = "The main interface consists of 6 buttons a bar and the scribblings.\n\nOn the bar you'll find two numbers, telling you how many scribblings you have in your list and what the maximum is.\n\nBelow these two numbers is a text, explaining in which 'mode' you are (more on that later).\n\nYou'll also see three lines of clickable text on the right, which will also be explained later.\n\nClicking on a scribbling in the list will copy it's text to the clipboard, except for 'special' scribblings (more on that later).";
  var helpData4 = "You can choose to hide (or show) the list of scribblings. This can be usefull when your list grows large, or when your display gets cluttered by Scribbler.\n\nTo hide (or show) the list, press the '-' button in the top-left corner (or the '+' button in case of showing the list).\n\nYou'll notice that Scribbler doesn't take much space when the list is hidden, but you'll not be able to see which scribblings are on the list!";
  var helpData5 = "The '?' button, is the help button (which you, most likely, have found already).\n\nPressing this button will bring you to the help section (this section) and can aid you in working with Scribbler.\n\nAlthough I tried to design this widget to be easy to use, some functions might be less obvious or clear. The help section tries to explain every detail of Scribbler, so you can use it as a reference.";
  var helpData6 = "If you want to clear your list with scribblings, you simply press the 'clear' button. Pressing this button will give you an alert, asking if you are sure to delete all the scribblings.\n\nIf you accidentally press this button, you still have a chance to save your scribblings!\n\nIf you're positive that you want to clear the list, simply press 'Yes' and the list will be cleared, with an exception for 'pinned' scribblings (more on that later)!";
  var helpData7 = "There are two ways to add scribblings to your list.\n1: Click the 'add' button.\n2: Enable auto-add (more on that later).\n\nWhen you click the 'add' button, you'll see a prompt, where you can give the input for your scribbling. If you click 'Add' in the prompt, the scribbling will be added to the list.\n\nWhen you have reached your limit and still want to add a scribbling, an alert may appear (depending on your settings) asking you what to do!";
  var helpData8 = "There's a nifty little feature in Scribbler, which is called 'snapshot'. Whenever you click the 'snap' button, the current position of Scribbler will be stored.\n\nAt first this might not seem very special, because the Yahoo! Widget Engine™ remembers the widget position. This function is a little different though.\nIf you move the widget around your desktop and you click the 'restore' button, Scribbler will automatically move to the position where you made the snapshot!\n\nThis is great if you wish to give Scribbler a fixed position on the screen when you're done with it!";
  var helpData9 = "It's nice that Scribbler can store an unlimited amount of scribblings, but that may not be very efficient. Especially when you've enabled the 'auto-add' function, you don't want your list to grow too large.\n\nIf you want to control the size of the list, you simply click on the second number on the main interface. This will bring up a prompt to ask you what the new limit should be.\n\nIf you lower the limit and there are too many scribblings on your list, Scribbler will ask you what to do with the excessive scribblings!";
  var helpData10 = "By clicking the text 'auto-add: on' (or 'auto-add: off') you can enable or disable the automatical adding of scribblings.\n\nIf the 'auto-add' function is turned on and the contents of the system clipboard change, Scribbler will try to add the contents to the list of scribblings.\n\nThis can be very usefull when you are do a lot of copy/paste work with a lot of repetitive content! You should turn this feature off in most cases, because you might overpopulate the list!";
  var helpData11 = "If you want to prevent that your list will be populated by scribblings that are already in the list, you can enable the 'check dups' function by clicking on its text in the main interface.\n\nIf this function is enabled and you add a scribbling, Scribbler will make sure that you don't add something that is already in the list!\n\nThis might especially be usefull when you've turned on the 'auto-add' function.";
  var helpData12 = "If you decide to also use Scribbler as a 'quick launch' application (or if you just like this function, like me), you can enable the 'check specials' function by clicking on its text in the main interface.\n\nIf you have this function enabled and Scribbler detects a 'special' scribbling, it will display a small icon/text on the end of the scribbling.\n\nWhen you click a 'special' scribbling, it will not copy the text, but it will try to open the 'special' scribbling.\n\nScribbler can detect the following 'specials': URLs, FTPs, IP addresses, e-mail addresses and files and directories!";
  var helpData13 = "There are five different 'modes' that you can use in Scribbler, each of them has a certain purpose.\n\nThe default mode is 'copy / open', which means that clicking on a scribbling will copy the scribbling to the clipboard or will open the scribbling (when 'check specials' is on).\n\nIf you press and hold the 'z' key when Scribbler is active, you'll enter 'patch mode'. Clicking a scribbling in this mode will try to add the current clipboard contents to the scribbling. Very usefull when you want to append some data to a scribbling!";
  var helpData14 = "If you press and hold the 'x' key when Scribbler is active, you'll enter 'cut mode'. If you click a scribbling in this mode, Scribbler will copy the scribbling to the clipboard and delete it from your list. This might be usefull when you only want to use a scribbling once!\n\nIf you press and hold the 'c' key when Scribbler is active, you'll enter 'force copy mode'. Clicking a scribbling in this mode will always(!) copy the scribbling to the clipboard, even when you click a URL and 'check specials' is turned on! Very usefull to copy internet/e-mail adresses without actually opening them!";
  var helpData15 = "If you press and hold the 'v' key when Scribbler is active, you'll enter 'paste mode'. If you click a scribbling in this mode, the clicked scribbling will be replaced by the clipboard contents. This is very usefull when you want to replace a scribbling and don't want to add one and then delete one!\n\nThe last mode is accessed when you drag (& drop) something to the main Scribbler interface. You can drag & drop files, URLs and strings and Scribbler will automatically add them!\n\nYou can always provide me with feedback and/or wishes about the modes and I'll gladly add them for you!";
  var helpData16 = "You'll probably have some scribblings that you use a lot, or that are important, which you don't want to lose even when clearing the whole list. Scribbler provides a solution for this and it's called 'pinning'.\n\nWhenever you right-click (control-click for one-button Mac users) on a scribbling a context menu will appear. One of the options in this menu is called 'Pin this scribbling'. By selecting this option, Scribbler will never delete the scribbling!\n\nYou can of course delete the scribbling by right-clicking the scribbling and selecting 'Delete'!";
  var helpData17 = "Right-clicking (control-clicking for one-button Mac users) on a scribbling will (as mentioned before) display a context menu. In this menu you'll find some basic command that you can use for the scribblings.\n\n'Copy': will always copy the scribbling to the clipboard.\n'Paste': will always paste the clipboard contents over the scribbling.\n'Edit': will prompt the user to edit the scribbling.\n\n'Delete' and 'Pin this scribbling' have been discussed in the previous section.\n\n'Move up': will move the scribbling up in the list.\n'Move down': will move the scribbling down in the list.";
  var helpData18 = "'Search': will take you to your default search engine and will try to look for the scribbling value on the internet.\n'Advanced search...': will let you choose the search engine, make it your default and edit the scribbling to search more specifically.\n\n'Color adjustment...': will let you color the widget in all possible ways (Colorize, HSL Adjustment and HSL Tinting).\n'Bug report': will send an e-mail to the author which you can edit, to report a bug (this contains some system information, which you can delete if you wish).";
  var helpData19 = "By right-clicking anywhere on the widget, you can select 'Widget preferences...' from the displayed context menu. There are a couple of things you can alter in the preferences.\n\nGeneral: here you'll find a couple of general options for Scribbler. You can choose what should happen when the maximum is reached, how scribblings are added, to enable a background for scribblings, to define a hotkey sequence (more on that later), a default subject for emails and to use file icons instead of the default icons.\n\nColors: here you can define the colors for scribblings, hovering over scribblings, active scribblings and the shadows for scribblings.";
  var helpData20 = "Tinting: here you can alter the color of the whole widget. By dragging the sliders, you can alter the hue, saturation and lightness of the widget. This also affects the help file!\n\nAlerts: here you can choose to be alerted when you make a snapshot (the snapshot location will be displayed) and when you clear the list (this option is highly recommended!).\n\nWindow: here you can define the level of the widget, lock the widget's position and determine it's opacity.";
  var helpData21 = "If you have determined a hotkey sequence in the 'General' section of the preferences, you can use this key combination anytime to call Scribbler to be active and to move itself to the middle of the screen.\n\nThis will be very usefull when you're (e.g.) working in a document and need a scribbling to copy or paste. Simply press the key sequence and Scribbler will appear!\n\nTip: use this in combination with 'restore snapshot' to make Scribbler 'go back in it's corner' when you're done with it!"
  var headerData1 = "Introduction";
  var headerData2 = "Using the help section";
  var headerData3 = "The interface";
  var headerData4 = "Showing/hiding the list";
  var headerData5 = "The help button";
  var headerData6 = "Clearing the list";
  var headerData7 = "Adding scribblings";
  var headerData8 = "Taking/restoring a snapshot";
  var headerData9 = "Setting the limit";
  var headerData10 = "Auto-add scribblings";
  var headerData11 = "Check duplicates";
  var headerData12 = "Check specials";
  var headerData13 = "Modes";
  var headerData14 = "Modes (continued)";
  var headerData15 = "Modes (continued 2)";
  var headerData16 = "Pinning a scribbling";
  var headerData17 = "Context menu's";
  var headerData18 = "Context menu's (continued)";
  var headerData19 = "Preferences";
  var headerData20 = "Preferences (continued)";
  var headerData21 = "The hotkey sequence";
  helpDataArray = [ [helpData1,headerData1],
                    [helpData2,headerData2],
                    [helpData3,headerData3],
                    [helpData4,headerData4],
                    [helpData5,headerData5],
                    [helpData6,headerData6],
                    [helpData7,headerData7],
                    [helpData8,headerData8],
                    [helpData9,headerData9],
                    [helpData10,headerData10],
                    [helpData11,headerData11],
                    [helpData12,headerData12],
                    [helpData13,headerData13],
                    [helpData14,headerData14],
                    [helpData15,headerData15],
                    [helpData16,headerData16],
                    [helpData17,headerData17],
                    [helpData18,headerData18],
                    [helpData19,headerData19],
                    [helpData20,headerData20],
                    [helpData21,headerData21] ];
  
  HelpWindow = new Window();
  HelpWindow.width = 437;
  HelpWindow.height = 250;
  HelpWindow.hOffset = (screen.width / 2) - (HelpWindow.width/2);
  HelpWindow.vOffset = (screen.height / 2) - (HelpWindow.height/2);
  
  helpImage = new Image();
  helpImage.alignment = "center";
  helpImage.opacity = 255;
  helpImage.src = "Resources/Images/help0.png";
  helpImage.zOrder = 2;
  helpImage.window = HelpWindow;
  /*
  var pref7 = parseInt(preferenceArray[7]);
  switch (pref7) {
    case 1:
      eval("helpImage.colorize = 'r:"+preferenceArray[8]+",g:"+ preferenceArray[9]+",b:" + preferenceArray[10]+"';");
      break;
    case 2:
      eval("helpImage.colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
      break;
    case 3:
      eval("helpImage.hslAdjustment = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
    case 4:
      eval("helpImage.hslTinting = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
  }
  */
  
  nextImage = new Image();
  nextImage.alignment = "center";
  nextImage.opacity = 255;
  nextImage.src = "Resources/Images/next.png";
  nextImage.vOffset = 210;
  nextImage.hOffset = 387;
  nextImage.tooltip = "Go to the next help section";
  nextImage.window = HelpWindow;
  nextImage.onMouseDown = "nextHelp(1);";
  /*
  switch (pref7) {
    case 1:
      eval("nextImage.colorize = 'r:"+preferenceArray[8]+",g:"+ preferenceArray[9]+",b:" + preferenceArray[10]+"';");
      break;
    case 2:
      eval("nextImage.colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
      break;
    case 3:
      eval("nextImage.hslAdjustment = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
    case 4:
      eval("nextImage.hslTinting = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
  }
  */
  
  prevImage = new Image();
  prevImage.alignment = "center";
  prevImage.opacity = 120;
  prevImage.src = "Resources/Images/previous.png";
  prevImage.vOffset = 210;
  prevImage.hOffset = 344;
  prevImage.tooltip = "Go to the previous help section";
  prevImage.window = HelpWindow;
  prevImage.onMouseDown = "";
  /*
  switch (pref7) {
    case 1:
      eval("prevImage.colorize = 'r:"+preferenceArray[8]+",g:"+ preferenceArray[9]+",b:" + preferenceArray[10]+"';");
      break;
    case 2:
      eval("prevImage.colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
      break;
    case 3:
      eval("prevImage.hslAdjustment = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
    case 4:
      eval("prevImage.hslTinting = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
  }
  */
  
  quitImage = new Image();
  quitImage.alignment = "center";
  quitImage.opacity = 255;
  quitImage.src = "Resources/Images/close.png";
  quitImage.vOffset = 210;
  quitImage.hOffset = 40;
  quitImage.tooltip = "Close the help section";
  quitImage.window = HelpWindow;
  /*
  switch (pref7) {
    case 1:
      eval("quitImage.colorize = 'r:"+preferenceArray[8]+",g:"+ preferenceArray[9]+",b:" + preferenceArray[10]+"';");
      break;
    case 2:
      eval("quitImage.colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
      break;
    case 3:
      eval("quitImage.hslAdjustment = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
    case 4:
      eval("quitImage.hslTinting = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
  }
  */
  
  helpImage.hslAdjustment = nextImage.hslAdjustment = prevImage.hslAdjustment = quitImage.hslAdjustment = hue+","+sat+","+lit;
  
  headerText = new Text();
  headerText.alignment = "left";
  headerText.color = "#FFFFFF";
  headerText.data = helpDataArray[0][1];
  headerText.opacity = 255;
  headerText.size = 12;
  headerText.style = "bold";
  headerText.hOffset = 34;
  headerText.vOffset = 40;
  headerText.window = HelpWindow;
  
  textPlace = new TextArea();
  textPlace.alignment = "left";
  textPlace.color = "#FFFFFF";
  textPlace.data = helpDataArray[0][0];
  textPlace.editable = false;
  textPlace.height = 200;
  textPlace.hOffset = 29;
  textPlace.opacity = 255;
  textPlace.scrollbar = false;
  textPlace.size = 10;
  textPlace.style = "bold";
  textPlace.vOffset = 50;
  textPlace.width = 372;
  textPlace.window = HelpWindow;
  
  countText = new Text();
  countText.alignment = "center";
  countText.color = "#FFFFFF";
  countText.data = (helpNum + 1 )+"/"+helpDataArray.length;
  countText.opacity = 255;
  countText.size = 10;
  countText.style = "bold";
  countText.hOffset = (437/2)-(countText.width/2);
  countText.vOffset = 220;
  countText.window = HelpWindow;
  
  quitImage.onMouseDown = "helpDataArray = null; delete helpImage; delete headerText; delete nextImage; delete prevImage; delete quitImage; delete helpHeader; delete textArea; delete countText; HelpWindow.visible = false; delete HelpWindow; helpNum = 0;";
  HelpWindow.visible = true;
}

function nextHelp(x) {
  var l=helpDataArray.length-1;
  
  ((x == 1) ? ++helpNum : --helpNum );
  prevImage.opacity = ((helpNum == 0) ? 120 : 255 );
  prevImage.onMouseDown = ((helpNum == 0) ? "" : "nextHelp(-1);" );
  nextImage.opacity = ((helpNum == l) ? 120 : 255 );
  nextImage.onMouseDown = ((helpNum == l) ? "" : "nextHelp(1);" );
  textPlace.data = helpDataArray[helpNum][0];
  headerText.data = helpDataArray[helpNum][1];
  countText.data = (helpNum+1)+"/"+(l+1);
}

function handleClick(x) {
  var pref = preferenceArray[0];
  
  switch (isPressed) {
    case 1:
      scribArray[x] = customEscape(customUnescape(scribArray[x],2) + system.clipboard); // diegocr fix
      saveScribArray();
      break;
    case 2:
      system.clipboard = customUnescape(scribArray[x],1);
      removeScrib(x);
      break;
    case 3:
      system.clipboard = customUnescape(scribArray[x],1);
      saveScribArray();
      setActiveScrib(x);
      break;
    case 4:
      scribArray[x] = customEscape(system.clipboard); // diegocr fix
      saveScribArray();
      setActiveScrib(x);
      break;
    default:
      var pref5 = preferenceArray[5];
      if (pref5 == 1) {
        var retCheck = checkUrl(scribArray[x]);
        switch (retCheck) {
          case 1:
            openURL(customUnescape(scribArray[x]));
            break;
          case 2:
            openURL(customUnescape(scribArray[x]));
            break;
          case 3:
            openURL(customUnescape(scribArray[x]));
            break;
          case 4:
            openURL(customUnescape(scribArray[x]));
            break;
          case 5:
            openURL("mailto: " + customUnescape(scribArray[x])+"?subject="+defaultSubject);
            break;
          case 6:
            filesystem.open(convertPathToPlatform(customUnescape(scribArray[x])));
            break;
          case 7:
            filesystem.open(convertPathToPlatform(customUnescape(scribArray[x])));
            break;
          default:
            copyScrib(x);
            setActiveScrib(x);
            break;
        }
      } else {
        copyScrib(x);
        setActiveScrib(x);
      }
      break;
  }
  if (pref == 1) {
    clearList();
    drawList();
  }
}

function checkUrl(x) {
  var regURL1 = /^http:\/\/.*/ig;                           // http:// format
  var regURL2 = /^www[0-9]{0,1}\..*/i;                      // www[x]. format
  var regURL3 = /^ftp:\/\/.*/i;                             // ftp:// format
  var regURL4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i;    // IP-address format
  var regURL5 = /^\S+\@\w+\.[A-Za-z]+$/i;                   // E-mail address format
  var isURL = 0;
  x = customUnescape(x);
  
  if (x.match(regURL1) != null) {
    isURL = 1;
  } else if (x.match(regURL2) != null) {
    isURL = 2;
  } else if (x.match(regURL3) != null) {
    isURL = 3;
  } else if (x.match(regURL4) != null) {
    var ipAr = x.split(".");
    if ((ipAr[0] >= 0 && ipAr[0] <= 255) && (ipAr[1] >= 0 && ipAr[1] <= 255) && (ipAr[2] >= 0 && ipAr[2] <= 255) && (ipAr[3] >= 0 && ipAr[3] <= 255)) {
      isURL = 4;
    }
  } else if (x.match(regURL5) != null) {
    isURL = 5;
  } else if (filesystem.itemExists(x)) {
    if (filesystem.isDirectory(x)) {
      isURL = 6;
    } else {
      isURL = 7;
    }
  }
  return(isURL);
}

function checkPinned(x) {
  var isPinned = 0;
  var pin = preferences.PinEntries.value;
  
  if (pin == "") {
    return(isPinned)
  } else {
    var i=0;
    var l=pinArray.length;
    
    if (pin != "") {
      while (i<l) {
        var pini = pinArray[i]; 
        if (pini == x) {
          isPinned = 1;
          pinIndex = i;
        }
        ++i;
      }
    }
    return(isPinned);
  }
}

function drawBgImg(i) {
  bgAr[i] = new Image();
  bgAr[i].hOffset = 9;
  bgAr[i].vOffset = (65 + (i*15));
  if (useBg == 1) {
    bgAr[i].opacity = bgOpacity;
  } else {
    bgAr[i].opacity = 1;
  }
  bgAr[i].src = 'Resources/Images/scrib_bg.png';
  //bgAr[i].tooltip = customUnescape(scribArray[i]);
  bgAr[i].window = MainWindow;
  bgAr[i].onMouseDown = 'copyScrib('+i+'); setActiveScrib('+i+'); drawList();';
  var c=parseInt(preferenceArray[6]);
  switch (i) {
    case c:
      bgAr[i].onMouseExit = 'txtAr['+i+'].color = "'+activeColor+'"; customUnhover('+i+');';
      break;
    default:
      bgAr[i].onMouseExit = 'txtAr['+i+'].color = "'+scribFontColor+'"; customUnhover('+i+');';
      break;
  }
  bgAr[i].onMouseEnter = 'txtAr['+i+'].color = "'+hoverColor+'"; customHover('+i+')';
  /*
  c=parseInt(preferenceArray[7]);
  switch (c) {
    case 1:
      eval("bgAr["+i+"].colorize = 'r:"+preferenceArray[8]+",g:"+preferenceArray[9]+",b:"+preferenceArray[10]+"';");
      break;
    case 2:
      eval("bgAr["+i+"].colorize = '#"+preferenceArray[8]+preferenceArray[9]+preferenceArray[10]+"';");
      break;
    case 3:
      eval("bgAr["+i+"].hslAdjustment = '"+preferenceArray[8]+","+preferenceArray[9]+","+preferenceArray[10]+"';");
      break;
    case 4:
      eval("bgAr["+i+"].hslTinting = '"+preferenceArray[8]+","+preferenceArray[9]+","+preferenceArray[10]+"';");
      break;
    case 5:
      eval("bgAr["+i+"].colorize = '#"+preferenceArray[8]+preferenceArray[9]+preferenceArray[10]+"';");
      break;
  }
  */
  bgAr[i].hslAdjustment = hue+","+sat+","+lit;
}

function drawText(i) {
  txtAr[i] = new Text();
  txtAr[i].font = scribFont;
  txtAr[i].color = scribFontColor;
  if (useShadows == 1) {
    s = new Shadow();
    s.color = shadowColor;
    s.hOffset = 1;
    s.vOffset = 1;
    txtAr[i].shadow = s;
  }
  txtAr[i].hOffset = ((useBg == 1) ? 30 : 13);
  txtAr[i].vOffset = (74 + (i*15));
  txtAr[i].size = 10;
  txtAr[i].onMouseDown = 'copyScrib('+i+'); setActiveScrib('+i+'); drawList();';
  
  txtAr[i].truncation = 'end';
  
  txtAr[i].window = MainWindow;
  var retCheck = checkUrl(scribArray[i]);
  switch (retCheck) {
    case 6:
      var ep=resolvePath(customUnescape(scribArray[i]));
      txtAr[i].data = ep;
      //txtAr[i].tooltip = ep;
      break;
    case 7:
      var ep=resolvePath(customUnescape(scribArray[i]));
      txtAr[i].data = ep;
      //txtAr[i].tooltip = ep;
      break;
    default:
      var e=customUnescape(scribArray[i]);
      txtAr[i].data = e;
      //txtAr[i].tooltip = e;
      break;
  }
  var w = txtAr[i].width;
  if (useBg == 1) {
    if (w > 160) {
      txtAr[i].width = 160;
    }
  } else {
    if (w > 180) {
      txtAr[i].width = 176;
    }
  }
  var c=parseInt(preferenceArray[6]);
  switch (i) {
    case c:
      txtAr[i].color = activeColor;
      txtAr[i].onMouseExit = 'txtAr['+i+'].color = "'+activeColor+'"; customUnhover('+i+');';
      break;
    default:
      txtAr[i].color = scribFontColor;
      txtAr[i].onMouseExit = 'txtAr['+i+'].color = "'+scribFontColor+'"; customUnhover('+i+');';
      break;
  }
  txtAr[i].onMouseEnter = 'txtAr['+i+'].color = "'+hoverColor+'"; customHover('+i+');';
  if (scrollScribs == 1) {
    txtAr[i].onMouseEnter += 'txtAr['+i+'].scrolling = "autoLeft";';
    txtAr[i].onMouseExit += 'txtAr['+i+'].scrolling = "off";';
  }
  
  var styleAr = new Array();
  var mat = scribFont.match(/Bold/g);
  if (mat != null) {
    styleAr[styleAr.length] = "Bold";
  }
  mat = scribFont.match(/Italic/g);
  if (mat != null) {
    styleAr[styleAr.length] = "Italic";
  }
  var tmp = styleAr.join(", ");
  
  txtAr[i].style = tmp;
  if (useBg == 0) {
    bgAr[i].width = txtAr[i].width + 6;
  }
}

function drawExtra(i) {
  var c;
  imgAr[i] = new Image();
  imgAr[i].hAlign = 'center';
  imgAr[i].vAlign = 'center';
  imgAr[i].hOffset = 200;
  imgAr[i].vOffset = 71+(i*15);
  imgAr[i].window = MainWindow;
  var retCheck = checkUrl(scribArray[i]);
  
  /*
  c=parseInt(preferenceArray[7]);
  switch (c) {
    case 1:
      eval("imgAr["+i+"].colorize = 'r:"+preferenceArray[8]+",g:"+preferenceArray[9]+",b:"+preferenceArray[10]+"';");
      break;
    case 2:
      eval("imgAr["+i+"].colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
      break;
    case 3:
      eval("imgAr["+i+"].hslAdjustment = '"+preferenceArray[8]+","+preferenceArray[9]+","+preferenceArray[10]+"';");
      break;
    case 4:
      eval("imgAr["+i+"].hslTinting = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
      break;
    case 5:
      eval("imgAr["+i+"].colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
      break;
  }
  */
  imgAr[i].hslAdjustment = hue+","+sat+","+lit;
  
  switch (retCheck) {
    case 1:
    case 2:
      imgAr[i].src = 'Resources/Images/url.png';
      imgAr[i].tooltip = 'This scribbling is an URL.\nClick to go to the URL!';
      break;
    case 3:
      imgAr[i].src = 'Resources/Images/ftp.png';
      imgAr[i].tooltip = 'This scribbling is an FTP site.\nClick to connect to the FTP site!';
      break;
    case 4:
      imgAr[i].src = 'Resources/Images/ip.png';
      imgAr[i].tooltip = 'This scribbling is an IP address.\nClick to go to the IP address!';
      break;
    case 5:
      imgAr[i].src = 'Resources/Images/mail.png';
      imgAr[i].tooltip = 'This scribbling is an e-mail address.\nClick to send an e-mail!';
      break;
    case 6:
      imgAr[i].src = 'Resources/Images/dir.png';
      imgAr[i].tooltip = 'This scribbling is a local directory.\nClick to open it!';
      break;
    case 7:
      switch (parseInt(useIcons)) {
        case 1:
          imgAr[i].src = convertPathToPlatform(scribArray[i]);
          imgAr[i].useFileIcon = true;
          imgAr[i].height = sizeIcons;
          imgAr[i].width = sizeIcons;
          imgAr[i].colorize = "";
          imgAr[i].hslAdjustment = "";
          imgAr[i].hslTinting = "";
          break;
        default:
          imgAr[i].useFileIcon = false;
          imgAr[i].src = 'Resources/Images/file.png';
          break;
      }
      imgAr[i].tooltip = 'This scribbling is a local file.\nClick to open it!';
      break;
  }
  imgAr[i].onMouseDown = 'handleClick('+i+');';;
}

function drawList() {

  var i=0;
  var sc=scribArray.length;
  var pref5 = preferenceArray[5];
  
  MainWindow.height = 90;
  ModeImage.vOffset = 70;
  var h = MainWindow.height;
  var w = ModeImage.vOffset;
  
  while (i<sc) {
    //if (useBg == 1) {
      drawBgImg(i);
    //}
    drawText(i);
    if (pref5 == 1) {
      drawExtra(i);
    }
    if (useBg == 1) {
      delAr[i] = new Image();
      delAr[i].hAlign = 'center';
      delAr[i].vAlign = 'center';
      delAr[i].opacity = 1;
      delAr[i].tooltip = 'Delete this scribbling';
      delAr[i].src = 'Resources/Images/del.png';
      delAr[i].hOffset = 18;
      delAr[i].vOffset = (71+(i*15));
      delAr[i].onMouseDown = 'removeScrib('+i+');';
      delAr[i].onMouseEnter = 'delAr['+i+'].opacity = 255';
      delAr[i].onMouseExit = 'delAr['+i+'].opacity = 1';
      delAr[i].window = MainWindow;
      
      
      
      /*
      var c=parseInt(preferenceArray[7]);
      switch (c) {
        case 1:
          eval("delAr["+i+"].colorize = 'r:"+preferenceArray[8]+",g:"+preferenceArray[9]+",b:"+preferenceArray[10]+"';");
          break;
        case 2:
          eval("delAr["+i+"].colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
          break;
        case 3:
          eval("delAr["+i+"].hslAdjustment = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
          break;
        case 4:
          eval("delAr["+i+"].hslTinting = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
          break;
        case 5:
          eval("delAr["+i+"].colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
          break;
      }
     */ 
      delAr[i].hslAdjustment = hue+","+sat+","+lit;
    }
    

    c = 0;
    
    var itemAr = new Array();
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Copy';
    itemAr[c].checked = false;
    itemAr[c].onSelect = 'copyScrib('+i+'); setActiveScrib('+i+');';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Paste';
    itemAr[c].checked = false;
    itemAr[c].onSelect = 'pasteScrib('+i+')';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Edit';
    itemAr[c].checked = false;
    itemAr[c].onSelect = 'editScrib('+i+')';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = '-';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Delete';
    itemAr[c].checked = false;
    itemAr[c].onSelect = 'removeScrib('+i+')';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = '-';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Pin this scribbling';
    itemAr[c].checked = false;

    var check = checkPinned(i);
    if (check) {
      itemAr[c].checked = true;
      if (useBg == 1) {
        bgAr[i].tooltip += "\nThis scribbling is pinned!";
      }
      if (pref5 == 1) {
        imgAr[i].tooltip += "\nThis scribbling is pinned!";
      }
      txtAr[i].tooltip += "\nThis scribbling is pinned!";   
    }

    itemAr[c].onSelect = 'pinScrib('+i+')';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = '-';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Move up';
    itemAr[c].checked = false;
    itemAr[c].onSelect = 'moveScrib(-1,'+i+')';
    itemAr[c].enabled = ((i > 0) ? true : false);
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Move down';
    itemAr[c].checked = false;
    itemAr[c].onSelect = 'moveScrib(1,'+i+')';
    itemAr[c].enabled = ((i < (sc-1)) ? true : false);
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = '-';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Search';
    itemAr[c].checked = false;
    itemAr[c].onSelect = 'searchScrib('+i+',true)';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = 'Advanced search...';
    itemAr[c].checked = false;
    itemAr[c].onSelect = 'searchScribAdvanced('+i+')';
    
    ++c;
    
    itemAr[c] = new MenuItem();
    itemAr[c].title = '-';
    
    if (useBg == 1) {
      bgAr[i].contextMenuItems = itemAr;
    }
    txtAr[i].contextMenuItems = itemAr;
    
    ++i;
  }
  
  MainWindow.height += (i*15);
  ModeImage.vOffset += (i*15);
  
  NumActiveScrib.data = sc;
  NumMaxScrib.hOffset = NumActiveScrib.hOffset + NumActiveScrib.width + 2;
  
  var menuItems = new Array();
  menuItems[0] = new MenuItem();
  menuItems[0].title = 'Color adjustment...';
  menuItems[0].checked = ((preferenceArray[7] == 0) ? false : true );
  //menuItems[0].onSelect = "colorForm(2);";
  menuItems[0].onSelect = "customColor();";
  
  menuItems[1] = new MenuItem();
  menuItems[1].title = 'Bug report';
  menuItems[1].checked = false;
  menuItems[1].onSelect = "bugForm();";
  
  MainWindow.contextMenuItems = menuItems;
  
  resumeUpdates();
}

function searchScrib(x,bool,engine) {
  var theURL;
  if (!engine) {
    engine = preferenceArray[11];
  }
  switch (parseInt(engine)) {
    case 0:
      theURL = 'http://www.amazon.com/gp/search/ref=br_ss_hs/102-8925005-2105757?search-alias=aps&keywords=';
      break;
    case 1:
      theURL = 'http://www.ask.com/web?q=';
      break;
    case 2:
      theURL = 'http://search.ebay.com//search/search.dll?from=R40&satitle=';
      break;
    case 3:
      theURL = 'http://www.google.com/search?q=';
      break;
    case 4:
      theURL = 'http://search.lycos.com/cgi-bin/pursuit?query=';
      break;
    case 5:
      theURL = 'http://search.msn.com/results.aspx?q=';
      break;
    case 6:
      theURL = 'http://en.wikipedia.org/wiki/Special:Search?search=';
      break;
    case 7:
      theURL = 'http://search.yahoo.com/search?p=';
      break;
  }
  switch (bool) {
    case true:
      theURL += escape(customUnescape(scribArray[x]));
      break;
    default:
      theURL += escape(x);
      break;
  }
  openURL(theURL);
}

function searchScribAdvanced(i) {
  var formArray = Array();
  var optionArray = Array('Amazon','Ask Jeeves','eBay','Google','Lycos','MSN','Wikipedia','Yahoo!');
  var optionValueArray = Array(0,1,2,3,4,5,6,7);
  var c = 0;
  var pref11 = preferenceArray[11];
  
  formArray[c] = new FormField();
  formArray[c].title = 'Search engine:';
  formArray[c].type = 'popup';
  formArray[c].description = 'Select the search engine you would like to use.';
  formArray[c].option = optionArray;
  formArray[c].optionValue = optionValueArray;
  formArray[c].defaultValue = preferenceArray[11];
  
  ++c;
  
  formArray[c] = new FormField();
  formArray[c].title = 'Make default search engine';
  formArray[c].type = 'checkbox';
  formArray[c].description = 'Check this checkbox if you want to make the selected search engine the default search engine.';
  if (pref11 != "") {
    formArray[c].value = 1;
  }
  
  ++c;
  
  formArray[c] = new FormField();
  formArray[c].title = 'Search for:';
  formArray[c].type = 'text';
  formArray[c].value = customUnescape(scribArray[i]);
  formArray[c].description = 'This is the text you want to search for.';
  
  result = form(formArray,'Advanced Search Options','Search!','Cancel');
  
  if (result) {
    if (result[1] == 1) {
      preferenceArray[11] = result[0];
      savePreferenceArray();
    }
    searchScrib(result[2],false,result[0]);
  }
}

function clearList() {
  var item;
  var pref5 = preferenceArray[5];
  
  suppressUpdates();
  ModeImage.vOffset = 70;
  MainWindow.height = 90;
  if (pref5 == 1) {
    for (item in imgAr) {
        imgAr[item].opacity = 0;
        delete imgAr[item];
    }
  }
  for (item in txtAr) {
      txtAr[item].opacity = 0;
      delete txtAr[item];
  }
  for (item in bgAr) {
    bgAr[item].opacity = 0;
    delete bgAr[item];
  }
  if (useBg == 1) {
    for (item in delAr) {
        delAr[item].opacity = 0;
        delete delAr[item];
    }
  }
}

function reDraw(x) {
  switch (x) {
    case 0:
      var pref = preferenceArray[0];
      ShowAll.src = "Resources/Images/show_" + ( (pref == "0") ? "all" : "none" ) + ".png";
      ( (pref == "0") ? eval("clearList();") : eval("drawList();") );
      break;
    case 2:
      NumMaxScrib.data = "/ " + preferenceArray[2];
      break;
    case 3:
      var pref3 = preferenceArray[3];
      AutoAddText.data = "auto-add: " + ( (pref3 == "0") ? "off" : "on" );
      SlashImage1.opacity = ( (pref3 == "0") ? 255 : 0 );
      break;
    case 4:
      var pref4 = preferenceArray[4];
      CheckDupText.data = "check dups: " + ( (pref4 == "0") ? "off" : "on" );
      SlashImage2.opacity = ( (pref4 == "0") ? 255 : 0 );
      break;
    case 5:
      var pref5 = preferenceArray[5];
      CheckUrlText.data = "check specials: " + ( (pref5 == "0") ? "off" : "on" );
      SlashImage3.opacity = ( (pref5 == "0") ? 255 : 0 );
      break;
  }
}

function debug() {
  print("Pref string: " + preferences.PrefValues.value)
  print("ShowAll: " + preferenceArray[0]);
  print("Snapshot: " + preferenceArray[1]);
  print("MaxScribs: " + preferenceArray[2]);
  print("AutoAdd: " + preferenceArray[3]);
  print("CheckDup: " + preferenceArray[4]);
  print("CheckUrl: " + preferenceArray[5]);
  print("ActiveScribIndex: " + preferenceArray[6]);
  print("ColorMode: " + preferenceArray[7]);
  print("Hue: " + preferenceArray[8]);
  print("Sat: " + preferenceArray[9]);
  print("Lit: " + preferenceArray[10]);
  print("ActionOnMax: " + actionOnMax);
  print("ReverseAdd: " + reverseAdd);
  print("");
  print("Scrib string: " + preferences.ScribEntries.value)
  for (var x in scribArray) {
    print("Scrib " + x + ": " + scribArray[x]);
  }
  print("");
  for (var y in pinArray) {
    print("Pin "+y+": " + pinArray[y]);
  }
  print("");
  print("MainWindow height: " + MainWindow.height);
}

function popUp() {  
  focusWidget();
  if (popUpCenter == 1) {
    var x = (screen.width / 2) - (MainWindow.width / 2);
    var y = (screen.height / 2) - (MainWindow.height / 2);
    MainWindow.moveTo(x,y,4);
  }
}

function tintScrib() {
  var styleAr = new Array();
  var mat = interfaceFont.match(/Bold/g);
  var pref = preferenceArray[0];
  
  NumActiveScrib.font = NumMaxScrib.font = ModeText.font = AutoAddText.font = CheckDupText.font = CheckUrlText.font = interfaceFont;
  
  if (mat != null) {
    styleAr[styleAr.length] = "Bold";
  }
  mat = interfaceFont.match(/Italic/g);
  if (mat != null) {
    styleAr[styleAr.length] = "Italic";
  }
  var tmp = styleAr.join(", ");
  
  NumActiveScrib.style = NumMaxScrib.style = ModeText.style = AutoAddText.style = CheckDupText.style = CheckUrlText.style = tmp;
  NumActiveScrib.color = NumMaxScrib.color = ModeText.color = AutoAddText.color = CheckDupText.color = CheckUrlText.color = interfaceFontColor;

  hue = preferenceArray[11];
  sat = preferenceArray[12];
  lit = preferenceArray[13];

  //BarImage.colorize = ShowAll.colorize = HelpMe.colorize = ClearAll.colorize = ManualAdd.colorize = SnapShot.colorize = SnapRestore.colorize = hue+","+sat+","+lit;;
  BarImage.hslAdjustment = ShowAll.hslAdjustment = HelpMe.hslAdjustment = ClearAll.hslAdjustment = ManualAdd.hslAdjustment = SnapShot.hslAdjustment = SnapRestore.hslAdjustment = hue+","+sat+","+lit;
  //BarImage.hslTinting = ShowAll.hslTinting = HelpMe.hslTinting = ClearAll.hslTinting = ManualAdd.hslTinting = SnapShot.hslTinting = SnapRestore.hslTinting = hue+","+sat+","+lit;;
  
  /*
  var c=parseInt(preferenceArray[7]);
  switch (c) {
    case 0:
      break;
    case 1:
      eval("BarImage.colorize = ShowAll.colorize = HelpMe.colorize = ClearAll.colorize = ManualAdd.colorize = SnapShot.colorize = SnapRestore.colorize = ModeImage.colorize = 'r:"+preferenceArray[8]+";g:"+preferenceArray[9]+";b:"+preferenceArray[10]+"';");
      break;
    case 2:
      eval("BarImage.colorize = ShowAll.colorize = HelpMe.colorize = ClearAll.colorize = ManualAdd.colorize = SnapShot.colorize = SnapRestore.colorize = ModeImage.colorize = '#"+preferenceArray[8]+preferenceArray[9]+preferenceArray[10]+"';");
      break;
    case 3:
      eval("BarImage.hslAdjustment = ShowAll.hslAdjustment = HelpMe.hslAdjustment = ClearAll.hslAdjustment = ManualAdd.hslAdjustment = SnapShot.hslAdjustment = SnapRestore.hslAdjustment = ModeImage.hslAdjustment = '"+preferenceArray[8]+","+preferenceArray[9]+","+preferenceArray[10]+"';");
      break;
    case 4:
      eval("BarImage.hslTinting = ShowAll.hslTinting = HelpMe.hslTinting = ClearAll.hslTinting = ManualAdd.hslTinting = SnapShot.hslTinting = SnapRestore.hslTinting = ModeImage.hslTinting = '"+preferenceArray[8]+","+preferenceArray[9]+","+preferenceArray[10]+"';");
      break;
    case 5:
      eval("BarImage.colorize = ShowAll.colorize = HelpMe.colorize = ClearAll.colorize = ManualAdd.colorize = SnapShot.colorize = SnapRestore.colorize = ModeImage.colorize = '#"+preferenceArray[8]+preferenceArray[9]+preferenceArray[10]+"';");
      break;
  }
  */
  if (pref == 1) {
    clearList();
    drawList();
  }
}




/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}

function customEscape(x) {
  return Base64.encode(x);
}

function customUnescape(x,b) {
  return Base64.decode(x);
}

function handleDragDrop() {
  var eventData = system.event.data;
  var i=1;
  var l=eventData.length;
  
  while (i<l) {
    addScrib(eventData[i]);
    ++i;
  }
}

function handleDragEnter() {
  var eventData = system.event.data;
  
  toggleMode(5);
}

function handleDragExit() {
  toggleMode(0);
}
/*
function colorForm(x) {
  var c = 0;
  var redirect = 0;
  var formArray = Array();
  var optionArray = Array('None','Colorize','Adjustment','Tinting');
  var optionValueArray = Array(0,1,2,3);
  var tickLabelArrayHA = Array('Blue','Purple','Red','Brown','Green');
  var tickLabelArraySA = Array('Grey','Normal','Colorful');
  var tickLabelArrayLA = Array('Dark','Normal','Bright');
  var tickLabelArrayHT = Array('Red','Green','Blue','Purple','Red');
  var tickLabelArrayST = Array('Grey','Colorful','Very colorful');
  var tickLabelArrayLT = Array('Very dark','Normal','Very bright');
  var pref7 = preferenceArray[7];

  switch (x) {
    case 0:
      tintScrib();
      return;
    case 1:
      preferenceArray[7] = 0;
      savePreferenceArray();
      tintScrib();
      return;
    // first form
    case 2:
      formArray[c] = new FormField();
      formArray[c].title = 'Color mode:';
      formArray[c].type = 'popup';
      if ((pref7 == 1) || (pref7 == 2)) {
        formArray[c].defaultValue = 1;
      } else {
        formArray[c].defaultValue = pref7-1;
      }
      formArray[c].option = optionArray;
      formArray[c].optionValue = optionValueArray;
      formArray[c].description = 'Choose the type of coloring you would like to apply to the widget';

      result = form(formArray,'Scribbler 3.0 - Coloring','Next','Cancel');
      
      if (result) {
        switch (parseInt(result[0])) {
          case 0:
            redirect = 1;
            break;
          case 1:
            redirect = 3;
            break;
          case 2:
            redirect = 4;
            break;
          case 3:
            redirect = 5;
            break;
          case 4:
            redirect = 6;
            break;
        }
      } else {
        redirect = 0;
      }
    break;
    // colorize form
    case 3:
      formArray[c] = new FormField();
      formArray[c].title = 'RGB value:';
      formArray[c].type = 'text';
      if (pref7 == 2) {
        formArray[c].defaultValue = preferenceArray[8] + preferenceArray[9] + preferenceArray[10];
      }
      formArray[c].description = 'Hexadecimal RGB value to apply to the scribbling. Leave this empty if you would like to specify decimal values below.';
      
      ++c;
      
      formArray[c] = new FormField();
      formArray[c].title = 'Red value:';
      formArray[c].type = 'text';
      if (pref7 == 1) {
        formArray[c].defaultValue = preferenceArray[8];
      }
      formArray[c].description = 'Decimal Red value to apply to the scribbling. This will override the hexadecimal value.';
      
      ++c;
      
      formArray[c] = new FormField();
      formArray[c].title = 'Green value:';
      formArray[c].type = 'text';
      if (pref7 == 1) {
        formArray[c].defaultValue = preferenceArray[9];
      }
      formArray[c].description = 'Decimal Green value to apply to the scribbling. This will override the hexadecimal value.';
      
      ++c;
      
      formArray[c] = new FormField();
      formArray[c].title = 'Blue value:';
      formArray[c].type = 'text';
      if (pref7 == 1) {
        formArray[c].defaultValue = preferenceArray[10];
      }
      formArray[c].description = 'Decimal Blue value to apply to the scribbling. This will override the hexadecimal value.';
      
      ++c;
      
      formArray[c] = new FormField();
      formArray[c].title = 'Color pick';
      formArray[c].type = 'color';
      formArray[c].description = 'Pick a color to colorize Scribbler.';
      formArray[c].defaultValue = "#"+preferenceArray[8]+preferenceArray[9]+preferenceArray[10];
      
      result = form(formArray,'Scribbler 3.0 - Colorizing','Apply','Previous');
      
      if (result) {
          // there's a hex value
          var hex = result[0];
          var hexl = hex.length;
          var hexValid = 0;
          var r = parseInt(result[1]);
          var g = parseInt(result[2]);
          var b = parseInt(result[3]);
          var rgbValid = 0;
          
          if (result[4].substr(0,1) == "#") {
            hex = result[4].substr(1,6);
            hexl = hex.length;
          }
          
          if (hexl == 3) {
            var tmp = hex.substr(0,1) + hex.substr(0,1) + hex.substr(1,1) + hex.substr(1,1) + hex.substr(2,1) + hex.substr(2,1);
            hex = tmp;
          }
          
          // hex is now 6 valid characters or invalid by default
          if (hexl == 6) {
            hexValid = 1;
            var y=0;
            var l=hex.length;
            var reg = /[0-9a-fA-F]{1}/ig;
            while (y<l) {
              if (!hex.substr(y,1).match(reg)) {
                hexValid = 0;
              }
              ++y;
            }
          }
          if (hexValid == 0) {
            //check if there's a valid RGB value
            if (((r >= 0) && (r <= 256)) && ((g >= 0) && (g <= 256)) && ((b >= 0) && (b <= 256))) {
              rgbValid = 1;
            }
            switch (rgbValid) {
              case 1:
                preferenceArray[7] = 1;
                preferenceArray[8] = r;
                preferenceArray[9] = g;
                preferenceArray[10] = b;
                savePreferenceArray();
                getPreferenceArray();
                redirect = 0;
                break;
              default:
                alert("Both the hexadecimal '"+hex+"' and the RGB values ("+r+","+g+","+b+") are incorrect.\nPlease specify either a valid hexadecmial value or valid RGB values!");
                break;
            }
          } else {
            //use the hex, no matter what
            preferenceArray[7] = 2;
            preferenceArray[8] = hex.substr(0,2);
            preferenceArray[9] = hex.substr(2,2);
            preferenceArray[10] = hex.substr(4,2);
            savePreferenceArray();
            getPreferenceArray();
            redirect = 0;
          }
        
      } else {
        redirect = 2;
      }
      break;
    
    case 4:
      formArray[c] = new FormField();
      formArray[c].title = 'Hue value:';
      formArray[c].type = 'slider';
      formArray[c].minLength = -180;
      formArray[c].maxLength = 180;
      if (pref7 == 3) {
        formArray[c].defaultValue = preferenceArray[8];
      }
      formArray[c].tickLabel = tickLabelArrayHA;
      formArray[c].description = 'Alter the Hue Adjustment value of the widget.';
      
      ++c;
      
      formArray[c] = new FormField();
      formArray[c].title = 'Saturation value:';
      formArray[c].type = 'slider';
      formArray[c].minLength = -100;
      formArray[c].maxLength = 100;
      if (pref7 == 3) {
        formArray[c].defaultValue = preferenceArray[9];
      }
      formArray[c].tickLabel = tickLabelArraySA;
      formArray[c].description = 'Alter the Saturation Adjustment value of the widget.';
      
      ++c;
      
      formArray[c] = new FormField();
      formArray[c].title = 'Lightness value:';
      formArray[c].type = 'slider';
      formArray[c].minLength = -100;
      formArray[c].maxLength = 100;
      if (pref7 == 3) {
        formArray[c].defaultValue = preferenceArray[10];
      }
      formArray[c].tickLabel = tickLabelArrayLA;
      formArray[c].description = 'Alter the Lightness Adjustment value of the widget.';
      
      result = form(formArray,'Scribbler 3.0 - HSL Adjustment','Apply','Previous');
      
      if (result) {
        // store the values etc
        preferenceArray[7] = 3;
        preferenceArray[8] = result[0];
        preferenceArray[9] = result[1];
        preferenceArray[10] = result[2];
        savePreferenceArray();
        getPreferenceArray();
        redirect = 0;
      } else {
        redirect = 2;
      }
      break;
      
    case 5:
      formArray[c] = new FormField();
      formArray[c].title = 'Hue value:';
      formArray[c].type = 'slider';
      formArray[c].minLength = 0;
      formArray[c].maxLength = 360;
      if (pref7 == 4) {
        formArray[c].defaultValue = preferenceArray[8];
      }
      formArray[c].tickLabel = tickLabelArrayHT;
      formArray[c].description = 'Alter the Hue Tinting value of the widget.';
      
      ++c;
      
      formArray[c] = new FormField();
      formArray[c].title = 'Saturation value:';
      formArray[c].type = 'slider';
      formArray[c].minLength = 0;
      formArray[c].maxLength = 100;
      if (pref7 == 4) {
        formArray[c].defaultValue = preferenceArray[9];
      }
      formArray[c].tickLabel = tickLabelArrayST;
      formArray[c].description = 'Alter the Saturation Tinting value of the widget.';
      
      ++c;
      
      formArray[c] = new FormField();
      formArray[c].title = 'Lightness value:';
      formArray[c].type = 'slider';
      formArray[c].minLength = -100;
      formArray[c].maxLength = 100;
      if (pref7 == 4) {
        formArray[c].defaultValue = preferenceArray[10];
      }
      formArray[c].tickLabel = tickLabelArrayLT;
      formArray[c].description = 'Alter the Lightness Tinting value of the widget.';
      
      result = form(formArray,'Scribbler - HSL Tinting','Apply','Previous');
      
      if (result) {
        // store the values etc
        preferenceArray[7] = 4;
        preferenceArray[8] = result[0];
        preferenceArray[9] = result[1];
        preferenceArray[10] = result[2];
        savePreferenceArray();
        getPreferenceArray();
        redirect = 0;
      } else {
        redirect = 2;
      }
      break;
    
  }
  for (var i in formArray) {
    delete formArray[i];
  }
  colorForm(redirect);
}
*/

function bugForm() {
  // var mailTo = 'rp.kaper@wanadoo.nl';
  var mailTo = 'dcasorran@gmail.com';
  var mailSub = 'Scribbler: bug report';
  var mailBody = 'Version: Scribbler 5.0\r\n\f\r\n\fPlatform: '+system.platform+'\r\n\fLanguages: '+system.languages+'\r\n\f\r\n\fMemory: '+Math.round(system.memory.availPhysical/1024/1024)+' / '+Math.round(system.memory.totalPhysical/1024/1024)+' MB\r\n\fMemory load: '+system.memory.load+' percent\r\n\fCPU load: '+system.cpu.user+' / '+system.cpu.activity+'\r\n\f\r\n\fDisplay: '+screen.width+'x'+screen.height+' ('+screen.colorDepth+' DPI or '+screen.pixelDepth+' PPI)\r\n\fY!WE version: '+konfabulatorVersion()+'\r\n\f\r\n\fBug type:\r\n\fBug description:\r\n\f';
  
  openURL("mailto:"+mailTo+"?subject="+mailSub+"&body="+mailBody);
}

function popScrib() {
  var s = scribArray.length;
  
  if (s > 0) {
    popWindow = new Window();
    popWindow.level = 'topmost';  
    popWindow.visible = false;
    
    popImage = new Image();
    popImage.src = 'Resources/Images/pop_bg.png';
    popImage.alignment = 'center';
    popImage.vOffset = 6;
    
	var tteexxtt = customUnescape(scribArray[preferenceArray[6]],1);
	
    popText = new Text();
	if(tteexxtt.length > 40)
		popText.data = tteexxtt.substr(0,40);
	else
		popText.data = tteexxtt;
    popText.alignment = 'center';
    popText.size = 10;
    popText.style = 'bold';
    popText.font = scribFont;
    popText.vOffset = 15;
    popText.color = scribFontColor;
    
    popFade = new FadeAnimation(popWindow,0,200,animator.kEaseOut);
    
    popTimer = new Timer();
    popTimer.interval = 2;
    popTimer.ticking = false;
    popTimer.onTimerFired = 'animator.runUntilDone(popFade); delete popText; delete popImage; delete popWindow; delete popTimer; delete popFade;';
    
    popImage.width = popText.width + 8;
    popImage.hOffset = popWindow.width/2;
    
    popWindow.width = popText.width + 10;
    popWindow.height = popText.height + 10;
    
    var pop = parseInt(popUpArea);
    var aWidth = screen.availWidth;
    var aHeight = screen.availHeight;
    var popWidth = popWindow.width;
    var popHeight = popWindow.height;
    
    switch(pop) {
      case 0:
        popWindow.hOffset = (aWidth/2) - (popWidth/2);
        popWindow.vOffset = 80;
        break;
      case 1:
        popWindow.hOffset = 80;
        popWindow.vOffset = 80;
        break;
      case 2:
        popWindow.hOffset = 80;
        popWindow.vOffset = (aHeight/2) - (popHeight/2);
        break;
      case 3:
        popWindow.hOffset = 80;
        popWindow.vOffset = aHeight - 80;
        break;
      case 4:
        popWindow.hOffset = (aWidth/2) - (popWidth/2);
        popWindow.vOffset = aHeight - 80;
        break;
      case 5:
        popWindow.hOffset = aWidth - 80 - popWidth;
        popWindow.vOffset = aHeight - 80;
        break;
      case 6:
        popWindow.hOffset = aWidth - 80 - popWidth;
        popWindow.vOffset = (aHeight/2) - (popHeight/2);
        break;
      case 7:
        popWindow.hOffset = aWidth - 80 - popWidth;
        popWindow.vOffset = 80;
        break;
    }
    
    popText.hOffset = popWidth/2;
    popText.window = popWindow;
    popImage.hOffset = popWidth/2;
    popImage.window = popWindow;
    
    popImage.hslAdjustment = hue+","+sat+","+lit;
    
    /*
    var c=parseInt(preferenceArray[7]);
    switch (c) {
      case 1:
        eval("popImage.colorize = 'r:"+preferenceArray[8]+",g:"+ preferenceArray[9]+",b:" + preferenceArray[10]+"';");
        break;
      case 2:
        eval("popImage.colorize = '#"+preferenceArray[8] + preferenceArray[9] + preferenceArray[10]+"';");
        break;
      case 3:
        eval("popImage.hslAdjustment = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
        break;
      case 4:
        eval("popImage.hslTinting = '"+preferenceArray[8] + "," + preferenceArray[9] + "," + preferenceArray[10]+"';");
        break;
    }
    */
    popWindow.visible = true;
    popTimer.ticking = true;
  }
}

function customHover(x) {

  hoverTimer.interval = tooltipTime;
  hoverTimer.ticking = true;
  hoverTimer.onTimerFired = "hoverTimer.ticking = false; customUnhover();";

  hoverWindow = new Window();
  hoverWindow.hOffset = system.event.screenX+10;
  hoverWindow.vOffset = system.event.screenY+15;
  hoverWindow.opacity = 0;
  hoverWindow.visible = false;
  
  hoverBg2 = new Image();
  hoverBg2.src = "Resources/Images/pix3.png";
  hoverBg2.opacity = 255;
  
  hoverBg = new Image();
  hoverBg.src = "Resources/Images/pix2.png";
  hoverBg.opacity = 255;
  
  var tteexxtt = customUnescape(scribArray[x],1).replace("\r\n","\n");
  
  hoverText = new TextArea();
  if(tteexxtt.length > 400)
  	hoverText.data = tteexxtt.substr(0,400);
  else
  	hoverText.data = tteexxtt;
  //hoverText.data = customUnescape(scribArray[x],1).replace("\r\n","\n");
  hoverText.color = "#000000";
  hoverText.font = scribFont;
  hoverText.hOffset = 0;
  hoverText.vOffset = 1;
  hoverText.opacity = 255;
  hoverText.size = 10;
  hoverText.editable = false;
  hoverText.scrollbar = false;
  
  hoverBg2.width = hoverText.width+4;
  hoverBg2.height = hoverText.height+2;
  hoverBg2.hOffset = 0;
  hoverBg2.vOffset = 0;
  hoverBg2.window = hoverWindow;
  
  hoverBg.width = hoverText.width+2;
  hoverBg.height = hoverText.height;
  hoverBg.hOffset = 1;
  hoverBg.vOffset = 1;
  hoverBg.window = hoverWindow;
  
  hoverWindow.width = hoverText.width+20;
  hoverWindow.height = hoverText.height+20;
  
  hoverText.window = hoverWindow;

  hoverWindow.visible = true;
  hoverWindow.opacity = 255;
}

function customUnhover(x) {
  delete hoverText;
  delete hoverBg;
  delete hoverBg2;
  delete hoverWindow;
}

function hideControl() {
  var a = new FadeAnimation(ShowAll,0,250,animator.kEaseOut);
  var b = new FadeAnimation(HelpMe,0,250,animator.kEaseOut);
  var c = new FadeAnimation(ClearAll,0,250,animator.kEaseOut);
  var d = new FadeAnimation(ManualAdd,0,250,animator.kEaseOut);
  var e = new FadeAnimation(SnapShot,0,250,animator.kEaseOut);
  var f = new FadeAnimation(SnapRestore,0,250,animator.kEaseOut);
  var x = animator.start(new Array(a,b,c,d,e,f));
}

function showControl() {
  var a = new FadeAnimation(ShowAll,255,250,animator.kEaseIn);
  var b = new FadeAnimation(HelpMe,255,250,animator.kEaseIn);
  var c = new FadeAnimation(ClearAll,255,250,animator.kEaseIn);
  var d = new FadeAnimation(ManualAdd,255,250,animator.kEaseIn);
  var e = new FadeAnimation(SnapShot,255,250,animator.kEaseIn);
  var f = new FadeAnimation(SnapRestore,255,250,animator.kEaseIn);
  var x = animator.start(new Array(a,b,c,d,e,f));
}


var slider1_val;
var slider2_val;
var slider3_val;
var range = 16777215;

var sl1 = 0;
var sl2 = 0;
var sl3 = 0;

var hue;
var sat;
var lit;

function customColor() {
  sl1 = preferenceArray[11];
  sl2 = preferenceArray[12];
  sl3 = preferenceArray[13];
  var base = 6750208;

  colorWindow = new Window();
  colorWindow.width = 288;
  colorWindow.height = 360;
  colorWindow.visible = false;
  
  colorImage = new Image();
  colorImage.src = "Resources/Images/colorwindow.png";
  colorImage.hOffset = 0;
  colorImage.vOffset = 0;
  colorImage.window = colorWindow;
  
  quitImage = new Image();
  quitImage.src = "Resources/Images/quit_button.png";
  quitImage.hOffset = 13;
  quitImage.vOffset = 10;
  quitImage.tooltip = "Close this window";
  quitImage.onMouseDown = "colorWindow.visible = false;";
  quitImage.window = colorWindow;
  
  previewImage = new Image();
  previewImage.src = "Resources/Images/bar4.png";
  previewImage.hOffset = 34;
  previewImage.vOffset = 52;
  previewImage.tooltip = "Preview image";
  previewImage.window = colorWindow;
  
  previewImage.hslAdjustment = sl1+","+sl2+","+sl3;
  
  previewText = new Image();
  previewText.src = "Resources/Images/colortext.png";
  previewText.hOffset = 46;
  previewText.vOffset = 60;
  previewText.window = colorWindow;
  
  colorText = new Image();
  colorText.src = "Resources/Images/colors.png";
  colorText.hOffset = 22;
  colorText.vOffset = 135;
  colorText.window = colorWindow;
  
  //0 to 360 (-180 - +180)
  hueSlider = new Image();
  hueSlider.src = "Resources/Images/slider_hue.png";
  hueSlider.hOffset = 90;
  hueSlider.vOffset = 134;
  hueSlider.window = colorWindow;
  
  sliderArrow1 = new Image();
  sliderArrow1.src = "Resources/Images/slider_arrow.png";
  sliderArrow1.hOffset = 82+(((parseInt(preferenceArray[11])+180)/360)*145);
  sliderArrow1.vOffset = 128;
  sliderArrow1.tooltip = "Drag the slider to adjust the hue";
  sliderArrow1.onMouseMove = "handleSlider1();";
  sliderArrow1.window = colorWindow;
  
  contSlider = new Image();
  contSlider.src = "Resources/Images/slider_contrast.png";
  contSlider.hOffset = 90;
  contSlider.vOffset = 154;
  contSlider.window = colorWindow;
  
  contoSlider = new Image();
  contoSlider.src = "Resources/Images/slider_contrast_o.png";
  contoSlider.hOffset = 90;
  contoSlider.vOffset = 154;
  contoSlider.window = colorWindow;
  
  sliderArrow2 = new Image();
  sliderArrow2.src = "Resources/Images/slider_arrow.png";
  sliderArrow2.hOffset = 82+(((parseInt(preferenceArray[12])+100)/200)*145);;
  sliderArrow2.vOffset = 148;
  sliderArrow2.tooltip = "Drag the slider to adjust the contrast";
  sliderArrow2.onMouseMove = "handleSlider2();";
  sliderArrow2.window = colorWindow;
  
  brightSlider = new Image();
  brightSlider.src = "Resources/Images/slider_bright.png";
  brightSlider.hOffset = 90;
  brightSlider.vOffset = 174;
  brightSlider.window = colorWindow;
  
  sliderArrow3 = new Image();
  sliderArrow3.src = "Resources/Images/slider_arrow.png";
  sliderArrow3.hOffset = 82+(((parseInt(preferenceArray[13])+100)/200)*145);;
  sliderArrow3.vOffset = 168;
  sliderArrow3.tooltip = "Drag the slider to adjust the brightness";
  sliderArrow3.onMouseMove = "handleSlider3();";
  sliderArrow3.window = colorWindow;
  
  acceptButton = new Image();
  acceptButton.src = "Resources/Images/accept_button.png";
  acceptButton.hOffset = 200;
  acceptButton.vOffset = 316;
  acceptButton.onMouseDown = "colorWindow.visible = false; preferenceArray[11]=sl1; preferenceArray[12]=sl2; preferenceArray[13]=sl3; savePreferenceArray(); tintScrib();"
  acceptButton.window = colorWindow;
  
  cancelButton = new Image();
  cancelButton.src = "Resources/Images/cancel_button.png";
  cancelButton.hOffset = 130;
  cancelButton.vOffset = 316;
  cancelButton.onMouseDown = "colorWindow.visible = false;"
  cancelButton.window = colorWindow;
  
  colorWindow.visible = true;
}

function handleSlider1(){
  //tip is on 90
  //arrow is on 90-(17/2) = 88
  //slider end = 90+143=233
  //delta = 233-88 = 145
  
  var move = system.event.hOffset;
  var offset = sliderArrow1.hOffset+system.event.x;
  if ((move >= (hueSlider.hOffset+1)) && (move <= (hueSlider.hOffset+hueSlider.width)-2)) {
    sliderArrow1.hOffset = move-8;
  }
  //hOffset+8 = value t.o.v. 90 - 233 
  var val = ((((sliderArrow1.hOffset+8)-90)/145)*360)-180;
  sl1 = Math.round(val);
  previewImage.hslAdjustment = sl1+","+sl2+","+sl3;
  contSlider.hslAdjustment = sl1+","+sl2+","+sl3;
}

function handleSlider2() {
  var move = system.event.hOffset;
  var offset = sliderArrow2.hOffset+system.event.x;
  if ((move >= contSlider.hOffset) && (move <= (contSlider.hOffset+contSlider.width))) {
    sliderArrow2.hOffset = move-8;
  }
  var val = ((((sliderArrow2.hOffset+8)-90)/145)*200)-100;
  sl2 = Math.round(val);
  previewImage.hslAdjustment = sl1+","+sl2+","+sl3;
}

function handleSlider3() {
  var move = system.event.hOffset;
  var offset = sliderArrow3.hOffset+system.event.x;
  if ((move >= brightSlider.hOffset) && (move <= (brightSlider.hOffset+brightSlider.width))) {
    sliderArrow3.hOffset = move-8;
  }
  var val = ((((sliderArrow3.hOffset+8)-90)/145)*200)-100;
  sl3 = Math.round(val);
  previewImage.hslAdjustment = sl1+","+sl2+","+sl3;
}

getPreferenceArray();
tintScrib();
getScribArray();
getHotKey();
if (preferenceArray[0] == 0) {
  drawList();
}
var i=0;
var l=preferenceArray.length;
while (i<l) {
  reDraw(i);
  ++i;
}
i = null;
l = null;
if (MainWindow.hOffset == -1) {
  MainWindow.hOffset = (screen.width/2)-(MainWindow.width/2);
}
if (MainWindow.vOffset == -1) {
  MainWindow.vOffset = (screen.height/2)-(MainWindow.height/2);
}

MainWindow.visible = true;

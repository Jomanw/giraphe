'use strict';

// Import parts of electron to use
var electron = require("electron");
const {app, window, BrowserWindow, globalShortcut, ipcMain, Menu, MenuItem} = require('electron');
const path = require('path');
const url = require('url');
const RedisServer = require('redis-server');

// Simply pass the port that you want a Redis server to listen on.
const server = new RedisServer({
  conf: './redis.rb'
});


// Frameless windows:
// https://electronjs.org/docs/api/frameless-window

// const menu = new Menu()
// Mousetrap.bind('4', function() { console.log('4'); });
// Mousetrap.bind('4', function() {
//     console.log('4');
// });
// console.log(Mousetrap.getOwnPropertyNames(Mousetrap))

// menu.append(new MenuItem({
//   label: 'Print',
//   accelerator: 'Command+P',
//   click: () => { console.log('time to print stuff') }
// }))
// Define shortcut accelerators here.
const shortcutCombos = ['Command+\\', 'Command+Shift+E'];

// const configurationCombos = ['Command+S'];

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true;
}

function createMainWindow() {
  // Create the browser window.
  // Get the screen width and height to take up all screen area.
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  console.log(width)
  console.log(height)
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    transparent: false,
    resizable: false,
    frame: false,
    type:"toolbar",
    webPreferences: {
      nodeIntegration: true
    }
  })
  // mainWindow.maximize();

  app.dock.hide();
  mainWindow.setAlwaysOnTop(true, "floating");
  // mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setFullScreenable(false);

  mainWindow.loadFile( "index.html" );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open the DevTools automatically if developing
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on("blur", function() {
    // Menu.sendActionToFirstResponder('hide:');
    mainWindow.hide();
  });

  mainWindow.on("focus", function() {
    mainWindow.webContents.send("focused")
  });

  mainWindow.on('close', event=>{
      event.preventDefault(); //this prevents it from closing. The `closed` event will not fire now
      mainWindow.hide();
  });

  ipcMain.on("resize", function(event, height) {
    if ( dev ) {
      mainWindow.setSize(800, height + 30);
      mainWindow.setPosition(440, 212);
    } else {
      mainWindow.setSize(800, height + 30);
      mainWindow.setPosition(440, 212);
    }

  });

  mainWindow.hide();
}

// handles the global keyboard shortcuts
function activationHandler() {
  if (mainWindow.isVisible()) {
    Menu.sendActionToFirstResponder('hide:');
    mainWindow.hide();
  } else {
    // mainWindow.setVisibleOnAllWorkspaces(true); // put the window on all screens
    // mainWindow.focus(); // focus the window up front on the active screen
    mainWindow.show()
    // mainWindow.setVisibleOnAllWorkspaces(false); // disable all screen behavior
    // mainWindow.webContents.send("focused");
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  shortcutCombos.map(function(combo) {
    globalShortcut.register(combo, () => {
      activationHandler();
    })
  });
  server.open((err) => {
    if (err === null) {
      // You may now connect a client to the Redis
      // server bound to port 6379.
    }
  });
  createMainWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
  globalShortcut.unregisterAll()
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
    // createConfigurationWindow();
  }
});

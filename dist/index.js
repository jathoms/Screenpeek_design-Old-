"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        height: 500,
        width: 850,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        minHeight: 60,
        minWidth: 350,
        frame: false,
        titleBarStyle: "hidden",
        backgroundColor: "#131313",
    });
    electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: Object.assign(Object.assign({}, details.responseHeaders), { "Content-Security-Policy": [
                    "default-src 'self' https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css data: 'unsafe-eval' 'unsafe-inline'",
                ] }),
        });
    });
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", createWindow);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
let max;
electron_1.ipcMain.on("X", () => {
    electron_1.BrowserWindow.getFocusedWindow().close();
});
electron_1.ipcMain.on("min", () => {
    electron_1.BrowserWindow.getFocusedWindow().minimize();
});
electron_1.ipcMain.on("max", () => {
    max = electron_1.BrowserWindow.getFocusedWindow().isMaximized();
    if (!max) {
        electron_1.BrowserWindow.getFocusedWindow().maximize();
    }
    else {
        electron_1.BrowserWindow.getFocusedWindow().restore();
    }
});
electron_1.ipcMain.on("GET_SOURCES", () => __awaiter(void 0, void 0, void 0, function* () {
    const sources = yield electron_1.desktopCapturer.getSources({
        types: ["screen", "window"],
    });
    const videoOptionsMenu = electron_1.Menu.buildFromTemplate(sources.map((source) => {
        return {
            label: source.name,
            click: () => selectSource(source),
        };
    }));
    videoOptionsMenu.popup();
}));
const selectSource = (source) => __awaiter(void 0, void 0, void 0, function* () {
    electron_1.webContents.getFocusedWebContents().send("SOURCE_SEND", source.id);
});
//# sourceMappingURL=index.js.map
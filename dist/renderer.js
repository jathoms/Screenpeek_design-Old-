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
//import assets
require("./index.css");
require("../assets/logo.svg");
require("../assets/minim.svg");
require("../assets/X.svg");
require("../assets/fullscr.svg");
require("../assets/hexicon.svg");
require("../assets/multihex.svg");
require("../assets/orang.png");
const colourSame = (colour, oldColour) => {
    return (colour.r === oldColour.r &&
        colour.g === oldColour.g &&
        colour.b === oldColour.b &&
        colour.a === oldColour.a);
};
const ipcRenderer = window.require("electron").ipcRenderer;
const Xbtn = document.getElementById("X");
const minBtn = document.getElementById("minim");
const maxBtn = document.getElementById("fullscr");
const logo = document.getElementById("logo");
const sidebarTiles = document.getElementsByClassName("sidebar-element");
const sidebarButton1 = document.getElementById("hexicon");
let polling = false;
const closeWindow = () => {
    ipcRenderer.send("X");
};
const minWindow = () => {
    ipcRenderer.send("min");
};
const maxWindow = () => {
    ipcRenderer.send("max");
};
Xbtn.onclick = closeWindow;
minBtn.onclick = minWindow;
maxBtn.onclick = maxWindow;
const selectSidebarElement_changeSrc = (tile) => {
    const img = tile.firstElementChild;
    const src = img.currentSrc.split(".");
    src[0] = src[0] + "-select";
    const newSrc = src.join(".");
    img.src = newSrc;
    console.log(src.join("."));
    return 0;
};
const selectSidebarElement = (tile) => {
    const img = tile.firstElementChild;
    img.style.filter =
        "brightness(0) saturate(100%) invert(87%) sepia(20%) saturate(7328%) hue-rotate(96deg) brightness(101%) contrast(104%) drop-shadow(0 0 12px #00ff94)";
    return 0;
};
const deselectSidebarElement = (tile) => {
    const img = tile.firstElementChild;
    img.style.filter = "initial";
    return;
};
const showPage = (pageTile) => {
    const page = document.getElementById(pageTile.id.replace("-tile", "-page"));
    page.style.display = "flex";
    return;
};
const hidePage = (pageTile) => {
    const page = document.getElementById(pageTile.id.replace("-tile", "-page"));
    page.style.display = "none";
    return;
};
const sidebarButtons = [...sidebarTiles];
sidebarButtons.forEach((sidebarTile) => {
    sidebarTile.addEventListener("click", () => {
        for (const tile of sidebarButtons) {
            deselectSidebarElement(tile);
            hidePage(tile);
        }
        selectSidebarElement(sidebarTile);
        showPage(sidebarTile);
    });
});
const getPixelColour = (X, Y) => {
    const data = processor.computeFrame();
    const Xnum = Math.min(Number(X) || 0, data.width);
    const Ynum = Math.min(Number(Y) || 0, data.height);
    if (typeof processor === undefined) {
        console.log("underf");
        return;
    }
    // console.log(`(${Xnum}, ${Ynum})`);
    const pixelIdx = (Ynum * data.width + Xnum) * 4;
    const pixelColour = {
        r: data.data[pixelIdx],
        g: data.data[pixelIdx + 1],
        b: data.data[pixelIdx + 2],
        a: data.data[pixelIdx + 3],
    };
    // console.log(pixelColour);
    return pixelColour;
};
const Xval = document.getElementById("Xval");
const Yval = document.getElementById("Yval");
const videoElement = document.getElementById("video");
const videoSelectBtn = document.getElementById("videoSelectBtn");
const getBtn = document.getElementById("getBtn");
const pollBtn = document.getElementById("pollSrc");
const getVideoSources = () => {
    ipcRenderer.send("GET_SOURCES");
};
ipcRenderer.on("SOURCE_SEND", (e, sourceId) => __awaiter(void 0, void 0, void 0, function* () {
    unsetSrc();
    // console.log(navigator.mediaDevices.getSupportedConstraints());
    const constraints = {
        audio: false,
        video: {
            // width: { min: 640, ideal: 1024, max: 1440 },
            // height: { min: 480, ideal: 576, max: 810 },
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: sourceId,
                maxWidth: 2000,
                maxHeight: 2000,
                maxFrameRate: 5,
            },
        },
    };
    const stream = yield navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks()[0].applyConstraints({});
    console.log(stream.getTracks()[0].getConstraints());
    console.log(stream.getTracks()[0].getSettings());
    console.log(stream.getTracks()[0]);
    videoElement.srcObject = stream.clone();
    videoElement.onloadedmetadata = () => __awaiter(void 0, void 0, void 0, function* () { return yield videoElement.play(); });
}));
videoSelectBtn.onclick = getVideoSources;
let go;
getBtn.addEventListener("click", () => {
    polling = !polling;
    console.log(`polling: ${polling}`);
    if (go) {
        clearInterval(go);
        go = null;
        return;
    }
    if (polling) {
        let colour = getPixelColour(Xval.value, Yval.value);
        let oldColour = getPixelColour(Xval.value, Yval.value);
        go = setInterval(() => {
            // console.log("checking");
            colour = getPixelColour(Xval.value, Yval.value);
            if (!colourSame(colour, oldColour)) {
                console.log("old:");
                console.log(oldColour);
                console.log("new:");
                console.log(colour);
                oldColour = getPixelColour(Xval.value, Yval.value);
            }
        }, 5);
    }
    else {
        return;
    }
});
const unset = document.getElementById("unsetSrc");
const unsetSrc = () => {
    console.log("..");
    if (!videoElement.srcObject) {
        return;
    }
    videoElement.srcObject.getTracks()[0].stop();
    videoElement.srcObject.removeTrack(videoElement.srcObject.getTracks()[0]);
    console.log(videoElement.srcObject);
    console.log(videoElement.srcObject.getTracks());
    videoElement.srcObject = null;
};
const poll = () => {
    console.log(`${videoElement.clientWidth}, ${videoElement.clientHeight}`);
    console.log(`${videoElement.videoWidth}, ${videoElement.videoHeight}`);
};
pollBtn.onclick = poll;
unset.onclick = unsetSrc;
const canv = document.getElementById("c1");
const processor = {};
processor.doLoad = function doLoad() {
    videoElement.addEventListener("play", () => {
        this.video = videoElement;
        this.c1 = canv;
        this.ctx1 = this.c1.getContext("2d");
        canv.width = videoElement.clientWidth;
        canv.height = videoElement.clientHeight;
        this.width = videoElement.clientWidth;
        this.height = videoElement.clientHeight;
        this.timerCallback();
    }, false);
};
processor.timerCallback = function timerCallback() {
    if (this.video.paused || this.video.ended) {
        return;
    }
    this.computeFrame();
    setTimeout(() => {
        this.timerCallback();
    }, 16.67);
};
processor.computeFrame = function computeFrame() {
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
    drawSelectedRegion(this.ctx1, this.height, this.width);
    const frame = this.ctx1.getImageData(0, 0, this.width, this.height);
    return frame;
};
processor.doLoad();
window.onresize = () => {
    canv.style.backgroundImage = `url(${canv.toDataURL()}`;
    canv.width = videoElement.clientWidth;
    canv.height = videoElement.clientHeight;
    processor.width = videoElement.clientWidth;
    processor.height = videoElement.clientHeight;
};
const drawSelectedRegion = (ctx, canvH, canvW) => {
    const rectW = canvW / 10;
    const rectH = canvH / 10;
    let Xnum = Number(Xval.value) || canvW / 2;
    let Ynum = Number(Yval.value) || canvH / 2;
    if (Xval.value && !Number(Xval.value)) {
        Xnum = 0;
    }
    if (Yval.value && !Number(Yval.value)) {
        Ynum = 0;
    }
    ctx.beginPath();
    ctx.arc(Xnum, Ynum, 1.5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "#FF0000";
    ctx.strokeRect(Xnum - rectW / 2, Ynum - rectH / 2, rectW, rectH);
};
//# sourceMappingURL=renderer.js.map
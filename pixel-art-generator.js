//GLOBAL VARIABLES============================================================================================================================================================

const canvas = document.getElementById("canvasPixelArtGenerator");
const context = canvas.getContext("2d");

const sliderGridDimensions = document.getElementById("sliderGridDimensions");
const buttonToggleGridVisibility = document.getElementById("buttonToggleGridVisibility");
const buttonSaveCanvasImage = document.getElementById("buttonSaveCanvasImage");
const buttonClearBackgroundImage = document.getElementById("buttonClearBackgroundImage");
const fileLoadBackgroundImage = document.getElementById("fileLoadBackgroundImage");
const buttonGeneratePixelArt = document.getElementById("buttonGeneratePixelArt");

//CLASS DECLARATIONS=============================================================================================================================================================

class Pixel {

    color = null;

    static pixelSettings = {
        gridDimensions: 10,
        gridVisible: true,
        backgroundImage: null,
        drawPixelColors: false,
    }
    static pixelsSet = new Set();

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.initializePixel();
    };
    
    static setEnableAllPixelOutlines(booleanValue) {
        this.pixelSettings.gridVisible = booleanValue;
    };
    static initializeAllPixels() {
        this.pixelsSet.clear();
        const pixelSize = this.pixelSettings.gridDimensions;

        for (let x = 0; x < canvas.width; x += pixelSize) {
            for (let y = 0; y < canvas.height; y += pixelSize) {
                new Pixel(x, y, pixelSize, pixelSize);
            };
        };
    };
    static drawBackgroundImage() {
        if (this.pixelSettings.backgroundImage) {
            context.drawImage(this.pixelSettings.backgroundImage, 0, 0, canvas.width, canvas.height);
        };
    };
    static drawAllPixels() {
        for (let element of this.pixelsSet) {
            element.draw();
        }
    };
    static drawWhiteBackground() {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    static drawAllElements() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawWhiteBackground();
        this.drawBackgroundImage();
        this.drawAllPixels();
    };
    static setDrawPixelColors(booleanValue) {
        this.pixelSettings.drawPixelColors = booleanValue;
    };

    initializePixel() {
        this.constructor.pixelsSet.add(this);
    };
    draw() {
        if (this.constructor.pixelSettings.drawPixelColors) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        if (this.constructor.pixelSettings.gridVisible) {
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.strokeRect(this.x, this.y, this.width, this.height);
        };
    };
}

//FUNCTIONS=============================================================================================================================================================

//RUN APPLICATION FUNCTION=====================================================================================================================================

function runApplication() {
    Pixel.initializeAllPixels();
    Pixel.drawAllElements();
}

//DETERMINE POSSIBLE GRID DIMENSIONS===========================================================================================================================

function determinePossibleGridDimensions() {
    const smallestCanvasEdge = Math.min(canvas.height, canvas.width);

    sliderGridDimensions.max = smallestCanvasEdge / 10;
    sliderGridDimensions.value = 10;
}

//EVENT HANDLER FUNCTIONS====================================================================================================================================

//DOM EVENT HANDLERS==============================================================================================================================================================

function runApplicationWithInitialSettings() {
    determinePossibleGridDimensions();
    runApplication();
    setGridDimensions();
    setBackGroundImageToBlank();
}

//HELPER FUNCTIONS FOR EVENT LISTENERS========================================================================================================================

function setEnableImageGrid(booleanValue) {
    const currentValue = Pixel.pixelSettings.gridVisible;

    if (!booleanValue && currentValue) {
        toggleGridVisibility();
    } else if (booleanValue && !currentValue) {
        toggleGridVisibility();
    }
    Pixel.drawAllElements();
}

function setBackGroundImageToBlank() {
    fileLoadBackgroundImage.value = "";
    Pixel.pixelSettings.backgroundImage = null;

    Pixel.setDrawPixelColors(false);
    Pixel.drawAllElements();
    buttonGeneratePixelArt.disabled = true;
    buttonClearBackgroundImage.disabled = true;
}

//CLICK EVENT FUNCTIONS=======================================================================================================================================

function handleSliderClickEvent() {
    Pixel.pixelSettings.backgroundImage ? resizeCanvasToImage() : Pixel.drawAllElements();
    setGridDimensions();
}

//BUTTON EVENT FUNCTIONS=====================================================================================================================================

function setGridDimensions() {
    Pixel.pixelSettings.gridDimensions = Number(sliderGridDimensions.value);
    Pixel.initializeAllPixels();
    Pixel.setDrawPixelColors(false);
}

function toggleGridVisibility() {
    Pixel.pixelSettings.gridVisible === true ? Pixel.pixelSettings.gridVisible = false : Pixel.pixelSettings.gridVisible = true;
    buttonToggleGridVisibility.textContent = Pixel.pixelSettings.gridVisible === true ? "Grid Visible" : "Grid Hidden";
    Pixel.drawAllElements();
}

function restoreImageGridLogic(callbackFunction, displayImageGrid, resetToPreviousValue) {
    const previousValue = Pixel.pixelSettings.gridVisible;

    setEnableImageGrid(displayImageGrid);
    callbackFunction();

    if (resetToPreviousValue) {
        setEnableImageGrid(previousValue);
    }
}

function saveCanvasImage() {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    link.href = image;
    link.download = "pixel-art.png";
    link.click();
}

function loadBackgroundImage() {
    const imageReader = new FileReader();

    imageReader.addEventListener("load", () => {
        const image = new Image();

        image.addEventListener("load", () => {
            Pixel.pixelSettings.backgroundImage = image;
            resizeCanvasToImage();
            determinePossibleGridDimensions();
            setGridDimensions();

            buttonGeneratePixelArt.disabled = false;
            buttonClearBackgroundImage.disabled = false;
            Pixel.drawAllElements();
        });
        image.src = imageReader.result;
    });
    imageReader.readAsDataURL(fileLoadBackgroundImage.files[0]);
}

//AUTOMATICALLY COLORIZE IMAGE BASED ON IMAGE BACKGROUND===========================================================================================================

function determineRevisedImageSize() {
    const backgroundImage = Pixel.pixelSettings.backgroundImage;
    const imageRatio = backgroundImage.width / backgroundImage.height;
    let resizedWidth, resizedHeight;
    
    if (imageRatio > 1) { //width is greater than height
        resizedWidth = Math.min(backgroundImage.width, 600);
        resizedHeight = resizedWidth / imageRatio;
    } else if (imageRatio < 1) { //height is greater than width
        resizedHeight = Math.min(backgroundImage.height, 600);
        resizedWidth = resizedHeight * imageRatio;
    } else {
        resizedWidth = Math.min(backgroundImage.width, 600);
        resizedHeight = resizedWidth;
    }
    return {width: resizedWidth, height: resizedHeight};
}

function modifyImageSize(width, height) {
    const gridSize = Pixel.pixelSettings.gridDimensions;
    const widthAddition = width % gridSize;
    const heightAddition = height % gridSize;

    return {width: width - widthAddition, height: height - heightAddition};
}

function resizeCanvasToImage() {
    const rawMeasurements = determineRevisedImageSize();
    const finalMeasurements = modifyImageSize(rawMeasurements.width, rawMeasurements.height);

    canvas.width = finalMeasurements.width;
    canvas.height = finalMeasurements.height;
    Pixel.drawAllElements();
}

function autoColorizeImage() {
    if (Pixel.pixelSettings.backgroundImage) {
        const imageRGBSet = getFilteredPixelsSet();

        assignColorToPixel(imageRGBSet);
        Pixel.setDrawPixelColors(true);
        Pixel.drawAllElements();
    }
}

function assignColorToPixel(set) {
    const setIterator = set.values();
    let currentValue = setIterator.next().value;

    for (let element of Pixel.pixelsSet) {
        element.color = `rgb(${currentValue[0]}, ${currentValue[1]}, ${currentValue[2]})`;
        currentValue = setIterator.next().value;
    }
}

function getFilteredPixelsSet() {
    const imageRGBSet = new Set();
    const pixelSize = Pixel.pixelSettings.gridDimensions;
    const rawImageData = context.getImageData(pixelSize / 2, pixelSize / 2, canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x += pixelSize) {
        for (let y = 0; y < canvas.height; y += pixelSize) {
            const index = (y * canvas.width + x) * 4;
            imageRGBSet.add([rawImageData.data[index], rawImageData.data[index + 1], rawImageData.data[index + 2]]);
        }
    }
    return imageRGBSet;
}

//EVENT LISTENERS============================================================================================================================================================

document.addEventListener("DOMContentLoaded", runApplicationWithInitialSettings);
sliderGridDimensions.addEventListener("click", handleSliderClickEvent);

buttonToggleGridVisibility.addEventListener("click", toggleGridVisibility);
buttonSaveCanvasImage.addEventListener("click", saveCanvasImage);
buttonClearBackgroundImage.addEventListener("click", setBackGroundImageToBlank);
buttonGeneratePixelArt.addEventListener("click", () => restoreImageGridLogic(autoColorizeImage, false, true));

sliderGridDimensions.addEventListener("input", () => restoreImageGridLogic(setGridDimensions, true, false));
fileLoadBackgroundImage.addEventListener("change", loadBackgroundImage);

//==============================================================================================================================================================================
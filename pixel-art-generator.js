//GLOBAL VARIABLES============================================================================================================================================================

const canvas = document.getElementById("canvasPixelArtGenerator");
const context = canvas.getContext("2d");
const clickLocation = {x:null, y: null}; //object literal to store x and y coordinates of mouse click within canvas

const sliderGridDimensions = document.getElementById("sliderGridDimensions"); //slider used to set the size of the grid
const inputColorPicker = document.getElementById("colorPickerPixelColor"); //color picker used to set the color of individual pixels on canvas
const fileLoadBackgroundImage = document.getElementById("fileLoadBackgroundImage"); //file input used to load a background image

const buttonToggleGridVisibility = document.getElementById("buttonToggleGridVisibility");
const buttonSaveCanvasImage = document.getElementById("buttonSaveCanvasImage");
const buttonClearBackgroundImage = document.getElementById("buttonClearBackgroundImage");
const buttonGeneratePixelArt = document.getElementById("buttonGeneratePixelArt");

//CLASS DECLARATIONS=============================================================================================================================================================

class Pixel { //class used to create individual pixels for the pixel art grid

    color = null; //all pixels start out with no color

    static pixelSettings = {
        gridDimensions: 10, //width and height of each pixel
        gridVisible: true,
        backgroundImage: null,
        drawPixelColors: false, //draw pixel colors or leave blank
        pixelColor: "#006400", //pixel color used to paint individual pixels on canvas
    }
    static pixelsSet = new Set(); //all pixels are stored in this set

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.initializePixel();
    };
    
    static setEnableAllPixelOutlines(booleanValue) { //enable or disable the outlines of all pixels (i.e the grid)
        this.pixelSettings.gridVisible = booleanValue;
    };
    static initializeAllPixels() { //initializes all pixels in the grid simultaneously
        this.pixelsSet.clear();
        const pixelSize = this.pixelSettings.gridDimensions;

        for (let x = 0; x < canvas.width; x += pixelSize) {
            for (let y = 0; y < canvas.height; y += pixelSize) {
                new Pixel(x, y, pixelSize, pixelSize);
            };
        };
    };
    static drawBackgroundImage() { //draws the background image if it exists
        if (this.pixelSettings.backgroundImage) {
            context.drawImage(this.pixelSettings.backgroundImage, 0, 0, canvas.width, canvas.height);
        };
    };
    static drawAllPixels() { //draws all pixels in the grid simultaneously
        for (let element of this.pixelsSet) {
            element.draw();
        }
    };
    static drawWhiteBackground() { //draws the white background behind image (helpful for periods where background image is not set)
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    static drawAllElements() { //draws all elements in order for the canvas to be updated correctly
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawWhiteBackground();
        this.drawBackgroundImage();
        this.drawAllPixels();
    };
    static setDrawPixelColors(booleanValue) { //enable or disable the drawing of the fillColor of pixels (i.e the pixel colors)
        this.pixelSettings.drawPixelColors = booleanValue;
    };
    static determineClickedPixel() { //determine which pixel from the set was clicked and return it
        for (let element of this.pixelsSet) {
            if (element.determineIfClicked(clickLocation.x, clickLocation.y)) { //if pixel determines that it was clicked, return it
                return element;
            };
        };
    }

    initializePixel() { //initializes a single pixel and adds it to the set
        this.constructor.pixelsSet.add(this);
    };
    draw() { //draws a single pixel on canvas
        if (this.constructor.pixelSettings.drawPixelColors) { //only draw if drawPixelColors is enabled
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        if (this.constructor.pixelSettings.gridVisible) { //only draw if grid visibility is enabled
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.strokeRect(this.x, this.y, this.width, this.height);
        };
    };
    getBoundingBox() { //returns the bounding box of the pixel
        return {xMin: this.x, xMax: this.x + this.width, yMin: this.y, yMax: this.y + this.height};
    };
    determineIfClicked(x,y) { //return boolean value determining if the pixel was clicked
        const boundingBox = this.getBoundingBox();
        return (x > boundingBox.xMin && x < boundingBox.xMax && y > boundingBox.yMin && y < boundingBox.yMax);
    };
}

//FUNCTIONS=============================================================================================================================================================

//DETERMINE POSSIBLE GRID DIMENSIONS===========================================================================================================================

function determinePossibleGridDimensions() { //determines the possible grid dimensions for the grid based on the smallest canvas edge updates slider values to match
    const smallestCanvasEdge = Math.min(canvas.height, canvas.width);

    sliderGridDimensions.max = smallestCanvasEdge / 10; //limit slider value to 10% of smallest canvas edge
    sliderGridDimensions.value = 10; //set the default slider value to 10px
}

//EVENT HANDLER FUNCTIONS====================================================================================================================================

//CANVAS EVENT HANDLERS=======================================================================================================================================

function handleCanvasClickEvent(event) { //attached to canvas to handle click events
    firstPixelColor = Pixel.pixelsSet.values().next().value.color; //check whether first pixel has color value before determining the clicked pixel

    if (Pixel.pixelSettings.backgroundImage && firstPixelColor) { //perform color check because if no color is set, there is no reason to draw pixel/copy pixel data
        determineCanvasClickLocation(event);
        const clickedPixel = Pixel.determineClickedPixel(); //constant for the clicked pixel

        if (!clickedPixel) { //return if no pixel was clicked
            return;
        }

        if (event.button === 0) { //left click canvas event to paint pixel with active color
            paintPixelSelectedColor(clickedPixel);
        } else if (event.button === 2) { //right click canvas event to assign clicked pixel color to color picker
            assignClickedColorToColorPicker(clickedPixel.color); //assigns the clicked pixel color to the color picker (differentiates between rgb and hex values)
        }
    }
}

function paintPixelSelectedColor(clickedPixel) { //set the color of the clicked pixel to current color in color picker
    clickedPixel.color = inputColorPicker.value; 
}

function assignClickedColorToColorPicker(pixelColor) { //assigns the clicked pixel color to the color picker (differentiates between rgb and hex values)
    if (pixelColor.includes("rgb")) { //if the pixel color is in rgb format
        convertRGBToHexColor(pixelColor);
    } else { //if the pixel color is already in hex format
        inputColorPicker.value = pixelColor;
    }
}

function convertRGBToHexColor(rgbColor) { //function to convert image rgb color to hex color and assign to colorPicker
    let tempArray;

    tempArray = rgbColor.replace("rgb(","").replace(")","").split(","); //remove rgb string and split into array
    tempArray = tempArray.map(element => Number(element).toString(16).padStart(2, "0")); //convert array elements to hex
    inputColorPicker.value = "#" + tempArray.join(""); //set color picker value to hex color
}

function determineCanvasClickLocation(event) { //determine the x and y coordinates of the clicked pixel in relation to the canvas position
    const canvasBounds = canvas.getBoundingClientRect();

    clickLocation.x = event.clientX - canvasBounds.left; 
    clickLocation.y = event.clientY - canvasBounds.top; //set x and y coordinates of clicked pixel global object
}

//DOM EVENT HANDLERS==============================================================================================================================================================

function runApplicationWithInitialSettings() { //runs the application with initial settings after DOM is loaded
    determinePossibleGridDimensions(); //get possible grid dimensions
    setGridDimensions();
    setBackGroundImageToBlank(); //clear the background image and update canvas (also disables the slider)
    inputColorPicker.value = Pixel.pixelSettings.pixelColor; //set the initial value of the color picker to default green
}

//HELPER FUNCTIONS FOR EVENT LISTENERS========================================================================================================================

function setEnableImageGrid(booleanValue) { //attached to buttonToggleGridVisibility to toggle grid visibility
    const currentValue = Pixel.pixelSettings.gridVisible;

    if (!booleanValue && currentValue) { //if grid is currently visible, hide it
        toggleGridVisibility();
    } else if (booleanValue && !currentValue) { //if grid is currently hidden, show it
        toggleGridVisibility();
    }
    Pixel.drawAllElements(); //update canvas to reflect changes in grid visibility
}

function setBackGroundImageToBlank() { //attached to buttonClearBackgroundImage to clear background image
    fileLoadBackgroundImage.value = "";
    Pixel.pixelSettings.backgroundImage = null;

    Pixel.setDrawPixelColors(false); //disable drawing of pixel colors and hide existing drawn pixels
    Pixel.drawAllElements(); //update canvas to reflect changes in background image
    setEnablePageElements(true, true, true, true, true); //setup page elements after background image has been cleared
}

function setEnablePageElements(buttonGenerate, buttonClearBG, buttonSave, slider, colorPicker) { //configure page elements after performing various actions in page (generic function)
    buttonGeneratePixelArt.disabled = buttonGenerate;
    buttonClearBackgroundImage.disabled = buttonClearBG;
    buttonSaveCanvasImage.disabled = buttonSave;
    sliderGridDimensions.disabled = slider;
    inputColorPicker.disabled = colorPicker;
}

//CLICK EVENT FUNCTIONS=======================================================================================================================================

function handleSliderClickEvent() { //attached to sliderGridDimensions to update image grid dimensions and canvas size
    Pixel.pixelSettings.backgroundImage ? resizeCanvasToImage() : Pixel.drawAllElements(); //if image is loaded, resize canvas to image (else redraw canvas)
    setGridDimensions(); //update grid dimensions and reinitialize all pixels to match new grid dimensions
}

//BUTTON EVENT FUNCTIONS=====================================================================================================================================

function setGridDimensions() { //attached to sliderGridDimensions to update image grid dimensions
    Pixel.pixelSettings.gridDimensions = Number(sliderGridDimensions.value);
    Pixel.initializeAllPixels(); //reinitialize all pixels to match new grid dimensions
    Pixel.setDrawPixelColors(false); //disable drawing of pixel colors and hide existing drawn pixels
}

function toggleGridVisibility() { //attached to buttonToggleGridVisibility to toggle grid visibility
    Pixel.pixelSettings.gridVisible = !Pixel.pixelSettings.gridVisible; //switch boolean value of grid visibility
    buttonToggleGridVisibility.textContent = Pixel.pixelSettings.gridVisible ? "Grid Visible" : "Grid Hidden";
    Pixel.drawAllElements(); //update canvas to reflect changes in grid visibility
}

function restoreImageGridLogic(callbackFunction, displayImageGrid, resetToPreviousValue) { //function to run callback and then restore initial grid visibility after callback if desired
    const previousValue = Pixel.pixelSettings.gridVisible;

    setEnableImageGrid(displayImageGrid); //set grid visibility based on parameter passed
    callbackFunction(); //run the passed callback function

    if (resetToPreviousValue) { //if parameter passed is TRUE, restore initial grid visibility
        setEnableImageGrid(previousValue);
    }
}

function saveCanvasImage() { //attached to buttonSaveCanvasImage to save canvas image
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    link.href = image;
    link.download = "pixel-art.png"; //name given to the download
    link.click(); //auto click the link to download the image file directly
}

function loadBackgroundImage() { //attached to fileLoadBackgroundImage to load background image
    const imageReader = new FileReader();

    imageReader.addEventListener("load", () => { //wait for image to be chosen from file select popup window before proceeding
        const image = new Image();

        image.addEventListener("load", () => { //wait for image to load into page before proceeding
            Pixel.pixelSettings.backgroundImage = image;
            resizeCanvasToImage(); //resize image and canvas to fit with currently set grid dimensions size
            determinePossibleGridDimensions(); //get possible grid dimensions for new background image
            setGridDimensions(); //update grid dimensions and reinitialize all pixels to match new grid dimensions

            Pixel.drawAllElements(); //update canvas to reflect changes in background image and canvas size
            setEnablePageElements(false, false, false, false, true); //setup page elements after background image has been loaded
        });
        image.src = imageReader.result;
    });
    imageReader.readAsDataURL(fileLoadBackgroundImage.files[0]);
}

//AUTOMATICALLY COLORIZE IMAGE BASED ON IMAGE BACKGROUND===========================================================================================================

function determineRevisedImageSize() { //computes new image width and height based on background image and canvas size constraints
    const backgroundImage = Pixel.pixelSettings.backgroundImage;
    const imageRatio = backgroundImage.width / backgroundImage.height; //determine image ratio for resizing image width and/or height
    let resizedWidth, resizedHeight;
    
    if (imageRatio > 1) { //width is greater than height
        resizedWidth = Math.min(backgroundImage.width, 600);
        resizedHeight = resizedWidth / imageRatio;
    } else if (imageRatio < 1) { //height is greater than width
        resizedHeight = Math.min(backgroundImage.height, 600);
        resizedWidth = resizedHeight * imageRatio;
    } else { //image is square
        resizedWidth = Math.min(backgroundImage.width, 600);
        resizedHeight = resizedWidth;
    }
    return {width: resizedWidth, height: resizedHeight}; //return and pass new image width and height to modifyImageSize function
}

function modifyImageSize(width, height) { //modifies image width and height based on grid dimensions to make square pixels work properly in the image (i.e. no cropping/pixel overflow)
    const gridSize = Pixel.pixelSettings.gridDimensions;
    const widthAddition = width % gridSize; //how many pixels to subtract from width to make multiple of grid dimensions
    const heightAddition = height % gridSize; //how many pixels to subtract from height to make multiple of grid dimensions

    return {width: width - widthAddition, height: height - heightAddition}; //return and pass new image width and height to resizeCanvasToImage function
}

function resizeCanvasToImage() { //resizes canvas to fit with currently set grid dimensions and background image dimensions
    const rawMeasurements = determineRevisedImageSize();
    const finalMeasurements = modifyImageSize(rawMeasurements.width, rawMeasurements.height);

    canvas.width = finalMeasurements.width; //set proper canvas width compatible with grid dimensions
    canvas.height = finalMeasurements.height; //set proper canvas height compatible with grid dimensions
    Pixel.drawAllElements(); //update canvas to reflect changes in canvas size
}

function autoColorizeImage() { //attached to buttonAutoColorizeImage to automatically colorize image based on image background and grid dimensions size
    if (Pixel.pixelSettings.backgroundImage) {
        const imageRGBSet = getFilteredPixelsSet(); //getImageDate from background image and filter out pixels that are not needed for coloring

        assignColorToPixel(imageRGBSet); //colorize each grid element on canvas with color within corresponding location in imageRGBSet
        Pixel.setDrawPixelColors(true); //enable drawing of pixel colors to show the newly colored pixels on top of the background image
        Pixel.drawAllElements(); //update canvas to reflect changes in pixel colors
        inputColorPicker.disabled = false;
    }
}

function assignColorToPixel(set) { //iterates through pixel set and assigns color to each element on canvas (i.e. each pixel)
    const setIterator = set.values();
    let currentValue = setIterator.next().value; //stup the iterator function for the set

    for (let element of Pixel.pixelsSet) {
        element.color = `rgb(${currentValue[0]}, ${currentValue[1]}, ${currentValue[2]})`; //assign the RGB value to each pixel in the set
        currentValue = setIterator.next().value; //iterate through the set to obtain the next RGB value
    }
}

function getFilteredPixelsSet() { //use getImageData and filter out all pixels not needed to fill in canvas grid elements (i.e. pixels)
    const imageRGBSet = new Set();
    const pixelSize = Pixel.pixelSettings.gridDimensions;
    const rawImageData = context.getImageData(pixelSize / 2, pixelSize / 2, canvas.width, canvas.height); //get image data from background image (start sampling from center of first pixel)

    for (let x = 0; x < canvas.width; x += pixelSize) { //iterate through each pixel in x and y directions to filter out pixels not needed and add those needed to imageRGBSet
        for (let y = 0; y < canvas.height; y += pixelSize) {
            const index = (y * canvas.width + x) * 4;
            imageRGBSet.add([rawImageData.data[index], rawImageData.data[index + 1], rawImageData.data[index + 2]]); //add only needed pixels and skip all others
        }
    }
    return imageRGBSet; //return imageRGBSet to autoColorizeImage function
}

//EVENT LISTENERS============================================================================================================================================================

document.addEventListener("DOMContentLoaded", runApplicationWithInitialSettings); //run application with initial settings to setup
document.addEventListener("click", () => Pixel.drawAllElements()) //fixes GUI issue with canvas grid not being synced to current image size/etc.
window.addEventListener("contextmenu", event => event.preventDefault()); //disable right click context menu

canvas.addEventListener("mousedown", handleCanvasClickEvent); //handle mouse events on canvas (used for painting pixels after image is pixelated)

//both slider event listeners are necessary to set up grid dimensions and resizes canvas dynamically without GUI errors/etc.
sliderGridDimensions.addEventListener("click", handleSliderClickEvent); //sets up grid dimensions and resizes canvas whenever slider is clicked
sliderGridDimensions.addEventListener("input", () => restoreImageGridLogic(setGridDimensions, true, false)); //sets up grid dimensions and refreshes canvas whenever slider value changes

fileLoadBackgroundImage.addEventListener("change", loadBackgroundImage); //load background image when file is chosen

buttonToggleGridVisibility.addEventListener("click", toggleGridVisibility); //toggle grid visibility when button clicked
buttonSaveCanvasImage.addEventListener("click", saveCanvasImage); //save image when button clicked
buttonClearBackgroundImage.addEventListener("click", setBackGroundImageToBlank); //clear background image when button clicked
buttonGeneratePixelArt.addEventListener("click", () => restoreImageGridLogic(autoColorizeImage, false, true)); //colorize image when button clicked

//==============================================================================================================================================================================
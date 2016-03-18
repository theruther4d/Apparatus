const $ = require( 'nodobjc' );
const ffi = require( 'ffi' );
const path = require( 'path' );

// @TODO:
// * need to account for the dock height

/* Blur Class */
class Blur {
    constructor( el ) {
        this._target = el;
        this._wallPaper = this._getwallPaper();
        this._watchwallPaper();
        this._outputCanvas();
    }
};


/* BlurBg prototype */
const proto = Blur.prototype;


/*
 * Gets the current desktop walllpaper.
 *
 * @return {string} wallPaper - the wallPaper URL
*/
proto._getwallPaper = function() {
    // if( !this._wallPaperWatcher ) {
    //     this._watchwallPaper();
    // }

    const output = String(
        $.NSWorkspace( 'sharedWorkspace' )(
            'desktopImageURLForScreen', $.NSScreen( 'mainScreen' )
        )
    ).replace( /^file\:\/\/localhost/i, '' );

    return output;
};


/*
 * Redraws the <canvas> each tim the wallpaper changes.
*/
proto._watchwallPaper = function() {
    this._wallPaperWatcher = setInterval( function() {
        const newwallPaper = this._getwallPaper();

        if( newwallPaper != this._wallPaper ) {
            this._wallPaper = newwallPaper;
            this._outputCanvas();
        }

    }.bind( this ), 2000 );
};


/*
 * Creates a <canvas> element representing the desktop with the current background image and its positioning.
 *
 * @param {function} callback
 * @return {DOM el} canvas - the <canvas> representation of the desktop.
*/
proto._createDesktopReference = function( callback ) {
    // Setup:
    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );
    const ubershit = document.getElementById( 'ubershit' );
    const img = document.createElement( 'img' );
    img.onload = () => {
        const screenDimensions = ubershit.getBoundingClientRect();
        const imgDimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight
        };

        // Do some calculations:
        const imgRatio = imgDimensions.width / imgDimensions.height;
        const screenRatio = screenDimensions.width / screenDimensions.height;
        const scaleAxis = imgRatio > screenRatio ? 'width' : 'height';
        const oppAxis = scaleAxis == 'width' ? 'height' : 'width';
        const newScaledAxis = imgDimensions[scaleAxis] * ( screenDimensions[oppAxis] / imgDimensions[oppAxis] );
        const newNonScaledAxis = screenDimensions[oppAxis];
        const offset = ( newScaledAxis - screenDimensions[scaleAxis] ) / 2;
        const newWidth = scaleAxis == 'width' ? newScaledAxis : newNonScaledAxis;
        const newHeight = scaleAxis == 'height' ? newScaledAxis : newNonScaledAxis;
        const offsetX = scaleAxis == 'width' ? offset * -1 : 0;
        const offsetY = scaleAxis == 'height' ? offset * -1 : 0;

        // Do the deed:
        canvas.width = screenDimensions.width;
        canvas.height = screenDimensions.height;
        ctx.drawImage( img, 0, 0, imgDimensions.width, imgDimensions.height, offsetX, offsetY, newWidth, newHeight );
        callback( canvas );
    };
    img.src = this._wallPaper;
};


/*
 * Creates a <canvas> element representing the portion of the desktop behind the target element.
 *
 * @param {DOM el} reference - the full representation of the desktop to slice from.
 * @return {DOM el} canvas - the <canvas> representation of the desktop.
*/
proto._createOutputCanvas = function( reference ) {
    const dimensions = this._target.getBoundingClientRect();

    if( this._ctx ) {
        this._canvas.classList.add( 'hidden' );
        this._ctx.clearRect(0, 0, dimensions.width + 20, dimensions.height + 20 );
        this._ctx.drawImage( reference, dimensions.left, dimensions.top, reference.width + 20, reference.height + 20, 0, 0, reference.width, reference.height );
        setTimeout( function() {
            this._canvas.classList.remove( 'hidden' );
        }.bind( this ), 750 );
        return;
    }

    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    canvas.width = dimensions.width + 20;
    canvas.height = dimensions.height + 20;
    canvas.classList.add( 'ubershit-blur' );
    ctx.drawImage( reference, dimensions.left, dimensions.top, reference.width + 20, reference.height + 20, 0, 0, reference.width, reference.height );

    return canvas;
};


/*
 * Adds the <canvas> to the DOM.
*/
proto._outputCanvas = function() {
    this._createDesktopReference( function( canvas ) {
        const slice = this._createOutputCanvas( canvas );

        // Don't output <canvas> again if it already exists:
        if( this._ctx ) {
            return;
        }

        this._target.appendChild( slice );
        this._canvas = slice;
        this._ctx = slice.getContext( '2d' );
    }.bind( this ) );
};


$.framework( 'cocoa' );

window.Blur = Blur;

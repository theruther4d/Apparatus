const $ = require( 'nodobjc' );
const ffi = require( 'ffi' );
const path = require( 'path' );

/* Blur Class */
class Blur {
    constructor( el, blurAmt = 10 ) {
        this._target = el;
        this._blurAmt = blurAmt * 2;
        this._wallPaper = this._getwallPaper();
        this._watchwallPaper();
        this._outputCanvas();
    }
};


/* Blur prototype */
const proto = Blur.prototype;


/*
 * Gets the current desktop walllpaper.
 *
 * @return {string} wallPaper - the wallPaper URL
*/
proto._getwallPaper = function() {
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
        this._ctx.clearRect(0, 0, dimensions.width + this._blurAmt, dimensions.height + this._blurAmt );
        this._ctx.drawImage( reference, dimensions.left, dimensions.top, reference.width + this._blurAmt, reference.height + this._blurAmt, 0, 0, reference.width, reference.height );
        setTimeout( function() {
            this._canvas.classList.remove( 'hidden' );
        }.bind( this ), 750 );
        return;
    }

    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    canvas.width = dimensions.width + this._blurAmt;
    canvas.height = dimensions.height + this._blurAmt;
    canvas.classList.add( 'ubershit-blur' );
    canvas.style.top = `${( this._blurAmt / 2 ) * -1}px`;
    canvas.style.left = `${( this._blurAmt / 2 ) * -1}px`;
    canvas.style.webkitFilter = `blur( ${this._blurAmt / 2}px )`;
    ctx.drawImage( reference, dimensions.left, dimensions.top, reference.width + this._blurAmt, reference.height + this._blurAmt, 0, 0, reference.width, reference.height );

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

        const targetPositioning = this._target.style.position;

        if( targetPositioning == 'static' ) {
            this._target.style.position = 'relative';
        }

        slice.classList.add( 'hidden' );
        this._target.appendChild( slice );
        setTimeout( function() {
            slice.classList.remove( 'hidden' );
        }.bind( this ), 350 );
        this._canvas = slice;
        this._ctx = slice.getContext( '2d' );
    }.bind( this ) );
};


$.framework( 'cocoa' );

window.Blur = Blur;

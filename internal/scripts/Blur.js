/* Blur Class */
class Blur {
    constructor( el, blurAmt = 10, wallPaper, inject = true ) {
        this._target = el;
        this._blurAmt = blurAmt * 2;
        this._visible = inject;
        this._outputCanvas( wallPaper, inject );
    }
};


/* Blur prototype */
const proto = Blur.prototype;


/*
 * Creates a <canvas> element representing the desktop with the current background image and its positioning.
 *
 * @param {function} callback
 * @return {DOM el} canvas - the <canvas> representation of the desktop.
*/
proto._createDesktopReference = function( wallPaper, callback ) {
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
    img.src = wallPaper;
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

        setTimeout( function() {
            this._ctx.clearRect(0, 0, dimensions.width + this._blurAmt, dimensions.height + this._blurAmt );
            this._ctx.drawImage( reference, dimensions.left - 8, dimensions.top - 32, reference.width + this._blurAmt, reference.height + this._blurAmt, 0, 0, reference.width, reference.height );
        }.bind( this ), 500 );

        setTimeout( function() {
            this._canvas.classList.remove( 'hidden' );
        }.bind( this ), 750 );
        return;
    }

    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    canvas.width = dimensions.width + ( this._blurAmt );
    canvas.height = dimensions.height + ( this._blurAmt );
    canvas.classList.add( 'ubershit-blur' );
    canvas.style.top = `${( this._blurAmt / 2 ) * -1}px`;
    canvas.style.left = `${( this._blurAmt / 2 ) * -1}px`;
    canvas.style.webkitFilter = `blur( ${this._blurAmt / 2}px )`;
    ctx.drawImage( reference, dimensions.left - 8, dimensions.top - 32, reference.width, reference.height, 0, 0, reference.width + ( this._blurAmt * 2 ), reference.height + ( this._blurAmt * 2 ) );

    return canvas;
};


/*
 * Adds the <canvas> to the DOM.
*/
proto._outputCanvas = function( wallPaper, inject ) {
    this._createDesktopReference( wallPaper, function( canvas ) {
        const slice = this._createOutputCanvas( canvas );

        // Don't output <canvas> again if it already exists:
        if( this._ctx ) {
            return;
        }

        const targetPositioning = this._target.style.position;

        if( targetPositioning == 'static' ) {
            this._target.style.position = 'relative';
        }

        this._canvas = slice;
        this._ctx = slice.getContext( '2d' );

        if( inject ) {
            this.show();
        }
    }.bind( this ) );
};


proto.hide = function() {
    if( this._visible ) {
        this._target.removeChild( this._canvas );
        this._visible = false;
    }
}

proto.show = function() {
    this._canvas.classList.add( 'hidden' );
    this._target.appendChild( this._canvas );
    setTimeout( function() {
        this._canvas.classList.remove( 'hidden' );
    }.bind( this ), 350 );
    this._visible = true;
}

proto.update = function( wallPaper ) {
    this._outputCanvas( wallPaper );
}

window.Blur = Blur;

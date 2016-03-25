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


/**
 * Handles fading in the <canvas> after it's been redraws.
*/
proto._switchTransition = function( e ) {
    this._ctx.clearRect(0, 0, this._dimensions.width + this._blurAmt, this._dimensions.height + this._blurAmt );
    this._ctx.drawImage( this._reference, this._dimensions.left - 8, this._dimensions.top - 32, this._reference.width + this._blurAmt, this._reference.height + this._blurAmt, 0, 0, this._reference.width, this._reference.height );
    this._canvas.classList.remove( 'hidden' );
    this._canvas.removeEventListener( 'transitionend', this._switchTransition.bind( this ) );
};


/**
 * Creates a <canvas> element representing the portion of the desktop behind the target element.
 *
 * @param {DOM el} reference - the full representation of the desktop to slice from.
 * @return {DOM el} canvas - the <canvas> representation of the desktop.
*/
proto._createOutputCanvas = function( reference ) {
    this._dimensions = this._target.getBoundingClientRect();
    this._reference = reference;

    if( this._ctx ) {
        this._canvas.addEventListener( 'transitionend', this._switchTransition.bind( this ) );
        this._canvas.classList.add( 'hidden' );
        return;
    }

    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    canvas.width = this._dimensions.width + ( this._blurAmt );
    canvas.height = this._dimensions.height + ( this._blurAmt );
    canvas.classList.add( 'ubershit-blur' );
    canvas.style.top = `${( this._blurAmt / 2 ) * -1}px`;
    canvas.style.left = `${( this._blurAmt / 2 ) * -1}px`;
    canvas.style.webkitFilter = `blur( ${this._blurAmt / 2}px )`;
    canvas.style.transform = `translateZ( 0 )`;
    ctx.drawImage( this._reference, this._dimensions.left - 8, this._dimensions.top - 32, this._reference.width, this._reference.height, 0, 0, this._reference.width + ( this._blurAmt * 2 ), this._reference.height + ( this._blurAmt * 2 ) );

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
    this._canvas.classList.remove( 'hidden' );
    this._visible = true;
}

proto.update = function( wallPaper ) {
    this._outputCanvas( wallPaper );
}

window.Blur = Blur;

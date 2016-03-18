const $ = require( 'nodobjc' );
const ffi = require( 'ffi' );
const path = require( 'path' );

class BlurBg {
    constructor() {
        $.framework( 'cocoa' );
    }
};

const proto = BlurBg.prototype;

proto._getWallPaper = () => {
    return String(
        $.NSWorkspace( 'sharedWorkspace' )(
            'desktopImageURLForScreen', $.NSScreen( 'mainScreen' )
        )
    ).replace( /^file\:\/\/localhost/i, '' );
};

proto._createDesktopMockup = () => {

}

// const bg = getBackground();
const bgImage = document.createElement( 'img' );
bgImage.src = getBackground();
bgImage.classList.add( 'bgImage' );
document.getElementById( 'ubershit' ).appendChild( bgImage );

const doBgBlur = () => {
    // Setup:
    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );
    const ubershit = document.getElementById( 'ubershit' );
    const img = document.querySelector( '.bgImage' );
    const wrapper = document.querySelector( '.playbox__wrapper' );
    const screenDimensions = ubershit.getBoundingClientRect();
    const imgDimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
    };
    const dimensions = wrapper.getBoundingClientRect();


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

    const canvas2 = document.createElement( 'canvas' );
    const ctxTwo = canvas2.getContext( '2d' );

    canvas2.width = dimensions.width;
    canvas2.height = dimensions.height;

    // Something with the width/height is too small!!!
    console.log( `output width: ${dimensions.width}` );
    console.log( `output height: ${dimensions.height}` );
    ctxTwo.drawImage( canvas, dimensions.left, dimensions.top, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height );
    canvas2.id = 'bozo';
    wrapper.appendChild( canvas2 );
};

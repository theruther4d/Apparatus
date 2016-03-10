let lastTrackId;
let lastSong;
let lastAlbum;
let lastArtist;

command( `/Users/josruthe/ubershit/widgets/playbox/getTrack.applescript`, ( err, res ) => {
    let track = res.split( '~' );
    let trackId = track.slice( 0, 2 ).join( '' );
    const hasChanged = trackId !== lastTrackId;
    let artist, song, album;

    // Don't do work unless things have changed:
    if( hasChanged ) {
        [artist, song, album] = track;
        console.log( `artist: ${artist}` );
        console.log( `song: ${song}` );
        console.log( `album: ${album}` );

        lastTrackId = trackId;
    }
}, 1000 );

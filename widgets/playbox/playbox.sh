#!/bin/sh

PWD=`pwd ${0}`
# ARTWORK='default.png'

# how do I run the applescripts in the background?

TRACK=`osascript "$PWD/widgets/playbox/getTrack.applescript"`;
ARTWORK=`osascript "$PWD/widgets/playbox/getArtwork.applescript"`

echo $TRACK "~" $ARTWORK

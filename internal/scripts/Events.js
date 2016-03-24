'use strict';

class Events {
    constructor() {

    }

    /**
    * Bind an event by name:
    *
    * @param {string} eventName - a single event, or multiple events separated by spaces \n.
    * @param {function} callBack
    */
    on( eventName, callBack ) {
        if( eventName.indexOf( ' ' ) > -1 ) {
            eventName.split( ' ' ).forEach( function( name ) {
                this._attachEvent( name, callBack );
            }.bind( this ) );
        } else {
            this._attachEvent( eventName, callBack );
        }
    }


    /**
    * Trigger the event by name:
    *
    * @param {string} eventName
    */
    trigger( eventName ) {
        if( !this._hasEvent( eventName ) ) {
            return false;
        }

        this._events[eventName].forEach( ( callBack ) => {
            callBack( eventName );
        });
    }
}

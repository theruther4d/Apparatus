'use strict';

/** A class for listening and responding to events. */
class Events {
    constructor() {
        this._events = {};
    }

    /**
     * Check if this instance contains an event by name.
     *
     * @param {string} eventName
     */
    _hasEvent( eventName ) {
        return this._events.hasOwnProperty( eventName );
    }


    /*
     * Does the actual event attaching for .on()
     *
     * @param {string} eventName - a single event.
     * @param {function} callBack
     */
    _attachEvent( eventName, callBack ) {
        if( !this._hasEvent( eventName ) ) {
            this._events[eventName] = [ callBack ];
            return;
        }

        this._events[eventName].push( callBack );
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

// /** Events Class */
// class Events {
//     constructor() {
//         this._events = {};
//     }
//
//     _hasEvent( eventName ) {
//         return this._events.hasOwnProperty( eventName );
//     }
//
//     on( eventName, callBack ) {
//         if( !this._hasEvent( eventName ) ) {
//             this._events[eventName] = [ callBack ];
//             return;
//         }
//
//         this._events[eventName].push( callBack );
//     }
//
//     /**
//      * Trigger the event by name:
//      */
//     trigger( eventName ) {
//         if( !this._hasEvent( eventName ) ) {
//             return false;
//         }
//
//         this._events[eventName].forEach( ( callBack ) => {
//             callBack();
//         });
//     }
// };

/**
 * Preference Class. Manages a persistent user preferences kept in local storage.
 *
 * @param {string} name - The identifier for the preference.
 * @param {any} value - The default value. If a previously set value is found in storage, that will be used.
 * @param {function} callBack - Triggers when the value changes.
 */
class Preference extends Events {
    constructor( name, value, callBack ) {
        super();
        this._name = name;
        this._callBack = callBack;

        // Check if we're already set in localStorage:
        const previousValue = localStorage.getItem( this._name );
        if( previousValue === null && typeof previousValue === 'object' ) {
            // set it up:
            this.value = value;
        } else {
            // Use what's already there:
            this.value = previousValue;
        }

        // Let everybody know when we change:
        this.on( 'valueChanged', function() {
            this._callBack( this.value );
        }.bind( this ) );
    }


    /**
     * Getter for value.
     */
    get value() {
        return localStorage.getItem( this._name );
    }


    /**
     * Setter for value.
     *
     * @param {any} newValue
     */
    set value( newValue ) {
        if( newValue === this._value ) {
            return this._value;
        }

        localStorage.setItem( this._name, newValue );
        this.trigger( 'valueChanged' );
    }
};

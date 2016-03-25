/**
 * Preference Class. Manages a persistent user preferences kept in local storage.
 *
 * @param {string} name - The identifier for the preference.
 * @param {any} value - The default value. If a previously set value is found in storage, that will be used.
 * @param {function} callBack - Triggers when the value changes.
 */
class Preference extends Events {
    constructor( name, value, callBack, persistent = true ) {
        super();
        this._name = name;
        this._callBack = callBack;
        this._persistent = persistent;

        // Check if we're already set in localStorage:
        const previousValue = localStorage.getItem( this._name );
        if( !this._persistent ) {
            this.value = value;
            this._tmpVal = `${value}`;
        } else if( previousValue === null && typeof previousValue === 'object' ) {
            // set it up:
            this.value = value;
        } else {
            // Use what's already there:
            this.value = previousValue;
        }

        // Let everybody know when we change:
        this.on( 'valueChanged', function() {
            const newValue = this._persistent ? this.value : this._tmpVal;
            this._callBack( newValue );
        }.bind( this ) );
    }


    /**
     * Getter for value.
     */
    get value() {
        if( !this._persistent ) {
            return `${this._tmpVal}`;   // force it to be a string to match localStorage
        }

        return localStorage.getItem( this._name );
    }


    /**
     * Setter for value.
     *
     * @param {any} newValue
     */
    set value( newValue ) {
        if( !this._persistent ) {
            if( newValue === this._tmpVal ) {
                return `${this._tmpVal}`;   // force it to be a string to match localStorage
            }

            this._tmpVal = `${newValue}`;
            this.trigger( 'valueChanged' );
            return `${this._tmpVal}`;
        }

        if( newValue === this._value ) {
            return this._value;
        }

        localStorage.setItem( this._name, newValue );
        this.trigger( 'valueChanged' );
    }
};

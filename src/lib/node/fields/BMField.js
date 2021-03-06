"use strict"

/*


*/
        
window.BMField = BMNode.extend().newSlots({
    type: "BMField",
    
    key: null,
    //value: "test value",

    isVisible: true,
    isEnabled: true,
	
    keyIsVisible: true,
    valueIsVisible: true,

    keyIsEditable: false,
    valueIsEditable: true, 
	
    canRemove: null,
	
    link: null,
    ownsLink: null,
	
    // only visible in UI
    valuePrefix: null,
    valuePostfix: null,
	
    valueMethod: null,
    noteMethod: null, // fetches note from a parent node method
		
    keyError: null,
    valueError: null,
	
    target: null,

    // new
    getterFunc: null, // example fieldSlot.setGetterFunc((target) => { ... })
    setterFunc: null,
}).setSlots({

    init: function () {
        BMNode.init.apply(this)
        this.nodeRowStyles().setToBlackOnWhite()
        return this
    },  
	
    target: function() {
        if (this._target) {
            return this._target
        }
		
        return this.parentNode()
    },
	
    valueMethod: function() {
        // defaults to key 
        if (this._valueMethod == null) {
            return this.key()
        }
		
        return this._valueMethod
    },
	
    setValue: function(v) { // called by View on edit
        //console.log("setValue '" + v + "'")
        var target = this.target()
        var setter = this.setterNameForSlot(this.valueMethod())

        if (this.setterFunc()) {
            this.setterFunc(target, this.valueMethod(), v)()
            target.didUpdateNode()
            this.validate()
        }

        if (!target[setter]) {
            console.warn("WARNING target = " + target.type() + " setter = '" + setter + "' missing")
        }

        v = this.normalizeThisValue(v)
        
        if (target[setter]) {
            target[setter].apply(target, [v])
            target.didUpdateNode()
            this.validate()
        } else {
            console.warn(this.type() + " target " + target.type() + " missing slot '" + setter + "'")
        }
		
        return this
    },
	
    normalizeThisValue: function(v) {
	    return v
    },
	
    value: function() {
        var target = this.target()
        var slotName = this.valueMethod()

        if (this.getterFunc()) {
            return this.getterFunc(target, slotName)()
        }

        //console.log("target = " + target.type() + " getter = '" + getter + "'")
        if (target[slotName]) {
            var value = target[slotName].apply(target)
            return value
        } else {
            console.warn(this.type() + " target " + target.type() + " missing slot '" + slotName + "'")
        }
    },
	
    note: function() {
        var target = this.target()
        var slotName = this.noteMethod()

        if (target && slotName) {
            if (target[slotName]) {
                return target[slotName].apply(target)
            } else {
                console.warn(this.type() + " target " + target.type() + " missing note getter slot '" + slotName + "'")
            }
        }
        return null
    },
	
    didUpdateView: function(aFieldView) {
        this.parentNode().didUpdateField(this)
        return this
    },
	
    visibleValue: function() {
        return this.value()
    },

    validate: function() {
        // subclasses should override if needed
        return true
    },    
	
    nodeRowLink: function() {
        return null
    },
})

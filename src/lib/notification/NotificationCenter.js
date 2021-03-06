"use strict"

/* 

    NotificationCenter
    
    A notification system that queues notifications and waits for the 
    app to return to the event loop (using a timeout) to post them. 
    It filters out duplicate notifications (posted on the same event loop) 
    and duplicate observations (same object registering the same observation again).
        
    Warning about Weak links: 
    
        As Javascript doesn't support weak links, you'll need to be careful
        about having your observers tell the NotificationCenter when they 
        are done observing, otherwise, it will hold a reference to them that
        will prevent them from being garbage collected and they'll continue
        to receive matching notifications. 
    
    Weak links solution (for target/sender):
    
        Instead of passing an object reference for: 
        
            Observation.setTarget() and 
            Notification.setSender()
        
        you can pass a uniqueId string/number for the object. e.g. the ideal.js 
        assigns each instance a _uniqueId.
        
        This should work assuming:
            - notification receiver doesn't already have a reference to the sender
            - observer can remove it's observation appropriately
        

    Example use:
 
        // start watching for "changed" message from target object
        this._obs = NotificationCenter.shared().newObservation().setName("changed").setObserver(this).setTarget(target).watch()
    
        // stop watching this observation
        this._obs.stopWatching()
        
        // stop watching all
        NotificationCenter.shared().removeObserver(this)
        
        // post a notification
        var note = NotificationCenter.shared().newNote().setSender(this).setName("hello").post()

        // repost same notification
        note.post()

*/

window.NotificationCenter = class NotificationCenter extends ProtoClass {
    init() {
        super.init()

        this.newSlots({
            observations: null,
            notifications: null,
            isDebugging: false,
            currentNote: null,
        })

        this.setObservations([]);
        this.setNotifications([]);
    }
    
    // --- observations ----
    
    hasObservation (obs) {
        return this.observations().detect(function (ob) { return ob.isEqual(obs) })
    }
    
    addObservation (obs) {
        if (!this.hasObservation(obs)) {
            this.observations().push(obs)
        }
        return this
    }

    newObservation () {
        return window.Observation.clone().setCenter(this);
    }
    
    removeObservation (anObservation) {  
        var filtered = this.observations().filter(function (obs) {
            return !obs.isEqual(anObservation)
        })
        this.setObservations(filtered)
        return this
    }
    
    removeObserver (anObserver) {        
        var filtered = this.observations().filter(function (obs) {
            return obs.observer() != anObserver
        })
        this.setObservations(filtered)
        return this;
    }

    // --- notifying ----
    
    hasNotification (note) {
        return this.notifications().detect(function (n) { 
            return n.isEqual(note) 
        })
    }
    
    addNotification (note) {
        if (!this.hasNotification(note)) {
            this.notifications().push(note)
		     window.SyncScheduler.shared().scheduleTargetAndMethod(this, "processPostQueue") //, -1)
        }
        return this
    }

    newNote () {
        return window.Notification.clone().setCenter(this)
    }
    
    // --- timeout & posting ---
    
    processPostQueue () {
        // keep local ref of notifications and set 
        // notifications to empty array in case any are
        // added while we process them
        this._currentNote = null
        if (!this._isProcessing) {
            this._isProcessing = true
            //console.log("processPostQueue " + this.notifications().length)
        
            var notes = this.notifications()
            this.setNotifications([])
            notes.forEach( (note) => {
                this._currentNote = note;
                //try { 
                this.postNotificationNow(note)
                //} catch (error) {
                //}
            })
            this._isProcessing = false
        } else {
            StackTrace.shared().showCurrentStack()
            console.warn("WARNING: attempt to call processPostQueue recursively while on note: ", this._currentNote)
        }
        
        return this
    }
    
    postNotificationNow (note) {
        // use a copy of the observations list in 
        // case any are added while we are posting 
        //
        // TODO: add an dictionary index to optimize? 
        

        this.setCurrentNote(note)
        
        if (this.isDebugging()) {
            console.log(this.type() + " sender " + note.sender() + " posting " + note.name())
            this.showObservers()
        }
        
        var observations = this.observations().copy()  
      
        observations.forEach( (obs) => {
            if (obs.matchesNotification(note)) {
                if (this.isDebugging()) {
                    console.log(this.type() + " " + note.name() + " matches obs ", obs)
                    console.log(this.type() + " sending ", note.name() + " to obs " + obs.type())
                }
            
                try {
                    obs.sendNotification(note)       
                } catch(error) {
                    //console.log("Error", typeof(error), "  ", error);
                    console.log("NOTIFICATION EXCEPTION: '" + error.message + "'");
                    //console.log("NotificationCenter: while posting note: ", note, " got error: ", error.name)
                    console.log("  OBSERVER (" + obs.observer() + ") STACK: ", error.stack)
                    if (note.senderStack()) {
                        console.log("  SENDER (" + note.sender() + ") STACK: ", note.senderStack())
                    }
                }
            }
        })        
        
        this.setCurrentNote(null)
    }
    
    showObservers () {
        var observations = this.observations() 
        console.log("observations:\n" + observations.map((obs) => { 
            return "    " + obs.observer().type() + " listening to " + obs.target() + " " + obs.name()
        }).join("\n") )
    }
    
    showCurrentNoteStack () {
        if (this.currentNote() == null) {
            //console.log("NotificationCenter.showCurrentNoteStack() warning - no current post")
        } else {
            console.log("current post sender stack: ", this.currentNote().senderStack())
        }
    }
}

window.NotificationCenter.registerThisClass()

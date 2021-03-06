"use strict"

/*
    
    PeerApp



*/

window.PeerApp = App.extend().newSlots({
    type: "PeerApp",

    name: "voluntary.app",
    version: [0, 5, 1, 0],

    // model
    about: null,
    localIdentities: null,
    network: null,
    dataStore: null,
    graphics: null,
    
    atomNode: null,

    // views
    browser: null,
    shelf: null,

    atomNodeView: null,

}).setSlots({

    init: function () {
        //this.setName("voluntary.app")

        App.init.apply(this)

    },

    setup: function () {
        App.setup.apply(this)
        

        if (false) {
            this.setupAtom()
        } else {
            
            this.setupModel()
            this.setupViews()
        }

        this.appDidInit()
        return this
    },

    setupAtom: function() {
        this.setAtomNode(AtomNode.clone())
        this.setAtomNodeView(AtomNodeView.clone().setNode(this.atomNode()))
        this.atomNodeView().setIsVertical(true).syncLayout()
        this.rootView().addSubview(this.atomNodeView())
    },

    // --- setup model ---

    setupModel: function () {

        // identities
        this.setLocalIdentities(NodeStore.shared().rootInstanceWithPidForProto("_localIdentities", BMLocalIdentities))
        this.addSubnode(this.localIdentities())

        // about 

        this.setAbout(BMStorableNode.clone().setTitle("Settings").setSubtitle(null).setNodeMinWidth(250))
        this.addSubnode(this.about())
		
        // --- about subnodes --------------------

        // network
        this.setNetwork(BMNetwork.shared())
        this.network().setLocalIdentities(this.localIdentities())
        this.about().addSubnode(this.network())

        // data store
        this.setDataStore(BMDataStore.clone())
        this.about().addSubnode(this.dataStore())

        // archive
        //var archive = BMArchiveNode.clone()
        //this.about().addSubnode(archive)

        // protos inspector
        //var protoNode = BMProtoNode.clone()
        //this.about().addSubnode(protoNode)

        this.network().servers().connect() // observe appDidInit instead?

        // --- graphics subnodes --------------------
		
        this.setGraphics(BMGraphics.clone())
        this.about().addSubnode(this.graphics())
		
        return this
    },

    // --- setup views ---
    
    setupViews: function() {
        this.setupBrowser()
        //this.setupShelf()
    },

    isBrowserCompatible: function() {
        if (WebBrowserWindow.agentIsSafari()) {
            return false
        }
        return true
    },
    
    setupBrowser: function() {	
        this.setBrowser(BrowserView.clone())
    
        this.browser().hideAndFadeIn()
        this.browser().setNode(this)
                
        this.rootView().addSubview(this.browser())
        this.browser().scheduleSyncFromNode()
        window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
        return this
    },

    setupShelf: function() {
        this.setShelf(ShelfView.clone())
        this.rootView().addSubview(this.shelf())

        window.SyncScheduler.shared().scheduleTargetAndMethod(this.shelf(), "appDidInit", 10)

        return this        
    },

    appDidInit: function () {
        App.appDidInit.apply(this)
        
        // LoadProgressBar can't use notification as it's a boot object
        // what if we added a one-shot observation for it, or would that be more confusing?

        window.LoadProgressBar.stop() 
    },
})

PeerApp.showVersion()


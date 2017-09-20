
BMChatMessage = BMAppMessage.extend().newSlots({
    type: "BMChatMessage",
	content: "",
}).setSlots({
    
    init: function () {
        BMAppMessage.init.apply(this)
        this.addStoredSlots(["content"])
        //this.addAction("delete")
    },	

	mostRecentDate: function() {
		return 0
	},
	
	nodeRowLink: function() {
		return null
	},
	
	title: function() {
	    return this.content()
	},
	
	wasSentByMe: function() {
		return this.senderId() === this.localIdentity()
	},
	
	contentDict: function() {
		var contentDict = {}
		contentDict.content = this.content()
		//console.log(this.typeId() + ".contentDict = ", contentDict)
		return contentDict
	},
	
	setContentDict: function(contentDict) {
		//console.log(this.typeId() + ".setContentDict = ", contentDict)
		this.setContent(contentDict.content)
		return this
	},
	
	isEqual: function(other) {
		return this.hash() == other.hash()
	},
	
	description: function() {
		return this.typeId() + "-" + this.hash() + "'" + this.content() + "'"
	},

	prepareToDelete: function() {
	    // TODO: mark MsgObjRecord as deleted
	},
})

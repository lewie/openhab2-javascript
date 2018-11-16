/**
 * Copyright (c) 2018 by Helmut Lehmeyer.
 * 
 * @author Helmut Lehmeyer 
 */

'use strict';

load(Java.type("java.lang.System").getenv("OPENHAB_CONF")+'/automation/jsr223/jslib/JSRule.js');

var me = "TimerExample.js";
logInfo("################# "+me+" ##################");

JSRule({
	name: me+" TimerExample",
	description: "TimerExample L:"+__LINE__,
	triggers: [ 
		TimerTrigger("0/15 * * * * ?")
	],
	execute: function( module, input){ 
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");
		
		logInfo( "createTimer start");
		createTimer(DateTime.now().plusSeconds(2), function(){
			logWarn( "createTimer stopped ");
		});
		
		logInfo( "setTimeout start");
		setTimeout(function(m){
			logWarn( "setTimeout stopped " + m);
		}, 1000, "bla");

	}
});


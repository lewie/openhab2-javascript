'use strict';

load('./../conf/automation/jsr223/jslib/JSRule.js');

var me = "ActionExamples.js";
logInfo("################# "+me+" ##################");

/**
 * Examples to import and use actions that are provided in standard Rule Engine too.
 * PersistenceExtensions
 * HTTP
 * Ping
 * Audio
 * Voice
 * ThingAction
 */

/**
 * getActions to see which actions are available
 */
JSRule({
	name: me+" getActions",
	description: "TEST L:"+__LINE__,
	triggers: [ 
		//TimerTrigger("0/15 * * * * ?")
	],
	execute: function( module, input){
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");	
		print("getActions: 	" + JSON.stringify( getActions() ));
	}
});
 
/**
 * PersistenceExtensions
 * PersistenceExtensions are default imported by helper.js see: 'jslib/PersistenceExtensions.js'
 */
JSRule({
	name: me+" PersistenceExtensions",
	description: "TEST L:"+__LINE__,
	triggers: [ 
		//TimerTrigger("0/15 * * * * ?")
	],
	execute: function( module, input){
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");	
		
		/*
		persist
		historicState
		changedSince
		updatedSince
		maximumSince
		minimumSince
		averageSince
		sumSince
		lastUpdate
		deltaSince
		evolutionRate
		previousState
		*/
		
		//print("PersistenceExtensions TEST: "+persistExt("previousState", "Suntracer_Temp"));
		// ATTENTION tit writes to DB!! print("PersistenceExtensions persist: 	"+persist("Suntracer_Temp", 22));
		print("PersistenceExtensions historicState: 	"+historicState("Suntracer_Temp", now().minusDays(3)));
		print("PersistenceExtensions changedSince: 	"+changedSince("Suntracer_Temp", now().minusDays(3)));
		print("PersistenceExtensions updatedSince: 	"+updatedSince("Suntracer_Temp", now().minusDays(3)));
		print("PersistenceExtensions maximumSince: 	"+maximumSince("Suntracer_Temp", now().minusDays(3)));
		print("PersistenceExtensions minimumSince: 	"+minimumSince("Suntracer_Temp", now().minusDays(3)));
		print("PersistenceExtensions averageSince: 	"+averageSince("Suntracer_Temp", now().minusDays(3)));
		print("PersistenceExtensions sumSince: 		"+sumSince("Suntracer_Temp", now().minusDays(3))); 	
		print("PersistenceExtensions lastUpdate: 	"+lastUpdate("Suntracer_Temp")); 
		print("PersistenceExtensions deltaSince: 	"+deltaSince("Suntracer_Temp", now().minusDays(3))); 
		print("PersistenceExtensions evolutionRate: 	"+evolutionRate("Suntracer_Temp", now().minusDays(3)));
		print("PersistenceExtensions previousState: 	"+previousState("Suntracer_Temp"));

	}
});

/**
 * HTTP !! IST DAS NÖTIG? SIEHE ### getActions ### in helper.js
 * sendHttpGetRequest(String url)
 * sendHttpGetRequest(String url, int timeout)
 * sendHttpPutRequest(String url)
 * sendHttpPutRequest(String url, int timeout)
 * sendHttpPutRequest(String url, String contentType, String content)
 * sendHttpPutRequest(String url, String contentType, String content, int timeout)
 * sendHttpPostRequest(String url)
 * sendHttpPostRequest(String url, int timeout)
 * sendHttpPostRequest(String url, String contentType, String content)
 * sendHttpPostRequest(String url, String contentType, String content, int timeout)
 * sendHttpDeleteRequest(String url)
 * sendHttpDeleteRequest(String url, int timeout)
 */
var HTTP = Java.type('org.eclipse.smarthome.model.script.actions.HTTP');
JSRule({
	name: me+" HTTP",
	description: "TEST L:"+__LINE__,
	triggers: [ 
		//TimerTrigger("0/15 * * * * ?")
	],
	execute: function( module, input){
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");	
		print("HTTP sendHttpGetRequest: 	" + HTTP.sendHttpGetRequest("http://www.heise.de"));
	}
});

/**
 * Ping
 * boolean checkVitality(String host, int port, int timeout)
 */
var Ping = Java.type('org.eclipse.smarthome.model.script.actions.Ping');
JSRule({
	name: me+" Ping",
	description: "TEST L:"+__LINE__,
	triggers: [ 
		//TimerTrigger("0/15 * * * * ?")
	],
	execute: function( module, input){
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");	
		print("Ping localhost: 	" + Ping.checkVitality("localhost", 22, 500));
	}
});

/**
 * Audio
 * playSound(String filename)
 * playSound(String sink, String filename)
 * playStream(String url)
 * playStream(String sink, String filename)
 * getMasterVolume()
 * setMasterVolume(float volume)
 * setMasterVolume(PercentType percent)
 * increaseMasterVolume(float volume)
 * decreaseMasterVolume(float volume)
 */
var Audio = Java.type('org.eclipse.smarthome.model.script.actions.Audio');
JSRule({
	name: me+" Audio",
	description: "TEST L:"+__LINE__,
	triggers: [ 
		//TimerTrigger("0/15 * * * * ?")
	],
	execute: function( module, input){
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");		
		print("Ping getMasterVolume: 	" + Audio.getMasterVolume());
	}
});

/**
 * Voice
 * say(Object text)
 * say(Object text, String voice)
 * say(Object text, String voice, String sink)
 * interpret(Object text)
 * interpret(Object text, String voice)
 * interpret(Object text, String voice, String sink)
 */
var Voice = Java.type('org.eclipse.smarthome.model.script.actions.Voice');
JSRule({
	name: me+" Voice",
	description: "TEST L:"+__LINE__,
	triggers: [ 
		//TimerTrigger("0/15 * * * * ?")
	],
	execute: function( module, input){
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");	
		print("Voice say 'Hello Voice': 	" + Voice.say("Hello Voice"));	
	}
});

/**
 * ThingAction
 * ThingStatusInfo getThingStatusInfo(String thingUid)
 */
var ThingAction = Java.type('org.eclipse.smarthome.model.script.actions.ThingAction');
JSRule({
	name: me+" ThingAction",
	description: "TEST L:"+__LINE__,
	triggers: [ 
		//TimerTrigger("0/15 * * * * ?")
	],
	execute: function( module, input){
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");		
		print("ThingAction getThingStatusInfo of': 	" + ThingAction.getThingStatusInfo("chromecast:chromecast:6a01c5ef0f0a6b3fd15849eda1379ab8"));	
	}
});
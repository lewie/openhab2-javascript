/**
 * Copyright (c) 2019 by Helmut Lehmeyer.
 * 
 * @author Helmut Lehmeyer 
 */

'use strict'; 
	var OPENHAB_CONF 			= Java.type("java.lang.System").getenv("OPENHAB_CONF");
	var automationPath 			= OPENHAB_CONF+'/automation/';
	var mainPath 				= automationPath + 'jsr223/';
	//https://wiki.shibboleth.net/confluence/display/IDP30/ScriptedAttributeDefinition
	var logger 					= Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.core.automation.module.script.rulesupport.internal.shared.SimpleRule");
	
	var RuleBuilder 			= Java.type("org.openhab.core.automation.util.RuleBuilder");
	var RuleManager 			= Java.type("org.openhab.core.automation.RuleManager");

	var uuid 					= Java.type("java.util.UUID");
	var ScriptExecution 		= Java.type("org.eclipse.smarthome.model.script.actions.ScriptExecution");
	var ScriptServiceUtil 		= Java.type("org.eclipse.smarthome.model.script.ScriptServiceUtil");
	var ExecUtil 				= Java.type("org.eclipse.smarthome.io.net.exec.ExecUtil");
	var HttpUtil 				= Java.type("org.eclipse.smarthome.io.net.http.HttpUtil");


	//Other
	var Modifier 				= Java.type("java.lang.reflect.Modifier");
	var InputStream				= Java.type("java.io.InputStream");
	var IOUtils					= Java.type("org.apache.commons.io.IOUtils");
	

	//Types
	var UnDefType 				= Java.type("org.eclipse.smarthome.core.types.UnDefType");
	var StringListType 			= Java.type("org.eclipse.smarthome.core.library.types.StringListType");	
	var RawType 				= Java.type("org.eclipse.smarthome.core.library.types.RawType");
	var RewindFastforwardType 	= Java.type("org.eclipse.smarthome.core.library.types.RewindFastforwardType");
	var PlayPauseType 			= Java.type("org.eclipse.smarthome.core.library.types.PlayPauseType");
	var NextPreviousType 		= Java.type("org.eclipse.smarthome.core.library.types.NextPreviousType");
		
	//Time JAVA 7 joda
	var DateTime 				= Java.type("org.joda.time.DateTime");
	//Time JAVA 8
	var LocalDate 				= Java.type("java.time.LocalDate");
	var LocalDateTime 			= Java.type("java.time.LocalDateTime");
	var FormatStyle 			= Java.type("java.time.format.FormatStyle");
	var DateTimeFormatter 		= Java.type("java.time.format.DateTimeFormatter");//https://www.programcreek.com/java-api-examples/?class=java.time.format.DateTimeFormatter&method=ofLocalizedDateTime
	var LocalTime 				= Java.type("java.time.LocalTime");
	var Month 					= Java.type("java.time.Month");
	var ZoneOffset 				= Java.type("java.time.ZoneOffset");
	var ZoneId 					= Java.type("java.time.ZoneId");
	var OffsetDateTime 			= Java.type("java.time.OffsetDateTime");

	var Timer = Java.type('java.util.Timer');
	
	//var QuartzScheduler = Java.type("org.quartz.core.QuartzScheduler");
	
	load( mainPath + 'jslib/PersistenceExtensions.js');
	
(function(context) {
  'use strict';	
	context.automationPath 	= automationPath;
	context.mainPath 		= mainPath;

	//Todo missing:
	context.UnDefType 	= UnDefType;
	context.OPEN 		= OpenClosedType.OPEN;
	context.CLOSED		= OpenClosedType.CLOSED;
	context.REWIND 		= RewindFastforwardType.REWIND;
	context.FASTFORWARD	= RewindFastforwardType.FASTFORWARD;
	context.PLAY 		= PlayPauseType.PLAY;
	context.PAUSE		= PlayPauseType.PAUSE;
	context.NEXT		= NextPreviousType.NEXT;
    context.PREVIOUS	= NextPreviousType.PREVIOUS;
	
	context.uuid = uuid;
	
	context.logInfo = function(type , value) {
		logger.info(args(arguments));
	};
	context.logWarn = function(type , value) {
		logger.warn(args(arguments));
	};
	context.logDebug = function(type , value) {
		logger.debug(args(arguments));
	};
	context.logError = function(type , value) {
		logger.error(args(arguments));
	};
	context.logTrace = function(type , value) {
		logger.trace(args(arguments));
	};
	
	
	context.console  = {};
	context.console.info = context.logInfo;
	context.console.warn = context.logWarn;
	context.console.debug = context.logDebug;
	context.console.error = context.logError;
	
	context.console.log = function(value) {
		logger.info("console.log", value);
	};
	
	context.isUndefined = function(item) {
		return isUndefinedState(item.state);
	};
	context.isUndefinedStr = function(itemStr) {
		return ir.getItem(itemStr) ? isUndefinedState(ir.getItem(itemStr).state) : true;
	};
	
	context.isUndefinedState = function(itemState) {
		if(itemState.toString() == "Uninitialized" || itemState.toString() == "Undefined")return true;
		return false;
	};
	
	context.getItem = function(it) {
		try {
			//print("################## "+ir.getItem(it));
			return (typeof it === 'string' || it instanceof String) ? ir.getItem(it) : it;
		}catch(err) {
			context.logError("getItem "+__LINE__, err);
		} 
		return null;
	};
	context.getItem.sendCommand = context.sendCommand;
	context.isUninitialized = function(it) {
		try {
			var item = context.getItem(it);
			if(item == null || item.state instanceof UnDefType || item.state.toString() == "Undefined" || item.state.toString() == "Uninitialized" )return true;
		}catch(err) {
			context.logError("isUninitialized "+__LINE__, err);
			return true;
		} 
		return false;
	};
	
	//returns item if exists, if got a value and this is not set, it will be updated
	context.updateIfUninitialized = function(it, val, getFromDB) {	
		try {
			var item = context.getItem(it);
			/*
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, item +" -> "+val);	//val -> undefined
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, isUninitialized(it));	//true
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, val == undefined);    //true
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, val == "undefined");  //false
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, val === null);        //false
			context.logInfo("|-|-updateIfUninitialized "+__LINE__, val == null);         //true
			if(val){context.logInfo("|-|-updateIfUninitialized "+__LINE__, "val is defined!!!!")};
			if(item){context.logInfo("|-|-updateIfUninitialized "+__LINE__, "item is defined!!!!")}; //item is defined!!!!
			
			if(item && item.state instanceof UnDefType){
				if(item.type == 
			}
			*/
			if(item == undefined || item == null){
				//gefährlich, es fehlt dann zB intValue()
				//if(val != undefined)postUpdate( it, val);
				//return context.getItem(it);
				context.error("updateIfUninitialized item not found "+__LINE__ + " item=" + item);
				return item;
			}
			if(getFromDB && isUninitialized(it)){
				var it_histval = historicState(it, now());
				if(it_histval != undefined){
					postUpdate( it, it_histval);
					context.logInfo("updateIfUninitialized use DB history "+__LINE__ + " it_histval=" + it_histval);
					return item;
				}
			}
			if( isUninitialized(it) && val != undefined){
				postUpdate( it, val);
				context.logInfo("updateIfUninitialized use gotten val "+__LINE__ + " val=" + val);
				return item;
			}
			return item;
		}catch(err) {
			context.logError("updateIfUninitialized "+__LINE__, err);
			return null;
		} 
		return null;
	};

	context.sendMail = function(mail, subject, message) {
		getAction("Mail").static.sendMail(mail, subject, message);
	};
	context.sendXMPP = function(mail, message) {
		getAction("XMPP").static.sendXMPP(mail, message);
	};
	context.transform = function(type, script, value) {
		//var myList = transform("JS", "wunderground.js", wundergr);//returns String
		//https://www.openhab.org/docs/configuration/transformations.html#usage
		context.logInfo("|-|-transform "+__LINE__, "type:" + type, "script:" + script, "content:" + value.substring(0, 40));
		var t = getAction("Transformation").static.transform;
		context.logInfo("|-|-transform "+__LINE__, "transform:" + t);

		getAction("Transformation").static.transform(type, script, value);
	};
	
	context.postUpdate = function(item, value) {
		//events.postUpdate((typeof item === 'string' || item instanceof String) ? ir.getItem(item) : item, value);
		try {
			//if(value == null || (!(Object.prototype.toString.call(value) === '[object String]') && isNaN(value) && (value+"") == "NaN")) {
			//	context.logError("helper.js postUpdate " + __LINE__ + ". Cannot execute postUpdate!. 'command' must not be null or NaN: Item: '" + item + "' with value: '" + value + "'");
			//}else{
				events.postUpdate(item, value);
			//}
		}catch(err) {
			context.logError("helper.js postUpdate " + __LINE__ + ". Item: '" + item + "' with value: '" + value + "' ' Error:" +  err);
		}
	};
	
	context.sendCommand = function(item, value) {
		//events.sendCommand((typeof item === 'string' || item instanceof String) ? ir.getItem(item) : item, value);
		//context.logError("sendCommand "+__LINE__, value, value+"" == "NaN", isNaN(value), (Object.prototype.toString.call(value) === '[object String]'));
		try {
			//if(value == null || (!(Object.prototype.toString.call(value) === '[object String]') && isNaN(value) && (value+"") == "NaN")) {
			//	context.logError("helper.js sendCommand " + __LINE__ + ". Cannot execute sendCommand!. 'command' must not be null or NaN: Item: '" + item + "' with value: '" + value + "'");
			//}else{
				events.sendCommand(item, value);
			//}
		}catch(err) {
			context.logError("helper.js sendCommand " + __LINE__ + ". Item: '" + item + "' with value: '" + value + "' ' Error:" +  err);
		}
	};

	context.sendCommandLater = function(item, value, millis) {
		//if(millis == undefined)millis = 1000;
		var zfunc = function(args){ 
			sendCommand(""+args[0], args[1]);
		};
		setTimeout( zfunc, millis || 1000, [item, value]);
	};
	
	//NOT TESTED YET: storeStates(Item...);
	context.storeStates = function(item) {
		events.storeStates((typeof item === 'string' || item instanceof String) ? ir.getItem(item) : item);
	};
	//NOT TESTED YET: restoreStates(Map<Item, State>);
	context.restoreStates = function(mapArray) {
		events.restoreStates(mapArray);
	};

	context.createTimer = function(time, runnable) {
		try{
			return ScriptExecution.createTimer(time, runnable);
		}catch(err) {
			context.logError("helper.js createTimer " + __LINE__ + " Error:" +  err);
		}
	};

	//https://blog.codecentric.de/en/2014/06/project-nashorn-javascript-jvm-polyglott/
	context.timerObject = {
		timerCount: 0,
		evLoops:[]
	};
	context.setTimeout = function(fn, millis, arg) {
		try{ 
			if( isFunction(fn) ){ //use
				var t = context.timerObject;
				if(t.timerCount > 999) t.timerCount = 0;
				var tCountLocal = t.timerCount + 1;
				t.timerCount = tCountLocal;
				t.evLoops[t.timerCount] = new Timer('jsEventLoop'+t.timerCount, false);
				t.evLoops[t.timerCount].schedule(function() {
					//context.logInfo("context.createTimer",  millis, t.timerCount, fn);
					//context.logInfo("context.createTimer " + context.now());
					fn(arg);
					try{ 
						//context.logWarn("setTimeout t.timerCount" + t.timerCount);//can be higher, because other Timers count up too.
						//context.logWarn("setTimeout t.tCountLocal" + tCountLocal);
						//cancel and purge itself
						if(t.evLoops[tCountLocal]){
							//context.logWarn("setTimeout t.evLoops[tCountLocal] found");
							t.evLoops[tCountLocal].cancel();
							t.evLoops[tCountLocal].purge();
						}
					}catch(err) {
						context.logError("helper.js setTimeout " + __LINE__ + " Error:" +  err);
					}
				}, millis);
				return t.evLoops[t.timerCount];
			}else{
				context.logWarn("helper.js setTimeout " + __LINE__ + "Please use like: setTimeout(function, milliseconds, arguments)");
			}
		}catch(err) {
			context.logError("helper.js setTimeout " + __LINE__ + " Error:" +  err);
		}
	};

	//round(ungerundeter Wert, Stellen nach dem Komma); round(6,66666, 2); -> 6,67
	context.round = function( x, p) { return(Math.round(Math.pow(10, p)*x)/Math.pow(10, p));};
	
	//Joda for Java 7 and openHAB2 !!!!!!NICHT AUF LocalDateTime UMSCHALTEN!!!!!!
	//https://github.com/JodaOrg/joda-time/issues/81
	context.now = function() { return DateTime.now();};
	//Java8: 
	//context.now 				= function() { return LocalDateTime.now(); };
	context.zoneOffset 			= function() { return OffsetDateTime.now().getOffset(); }; // +02:00
	context.isoDateTimeString 	= function() { return context.now() + (""+context.zoneOffset()).split(":").join(""); }; // '2018-09-11T12:39:40.004+0200'
	context.dateString 			= function(kind) { 
		//https://www.programcreek.com/java-api-examples/?class=java.time.format.DateTimeFormatter&method=ofLocalizedDateTime
		//return DateTimeFormatter.ofLocalizedDateTime(FormatStyle.SHORT, FormatStyle.SHORT).ISO_LOCAL_DATE_TIME;
		//var n = LocalDateTime.now();
        //System.out.println("Before : " + n);
        //// DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        //var formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
        //var formatDateTime = n.format(formatter);
		//System.out.println("After : " + formatDateTime);
		if(kind == "short")return LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yy HH:mm:ss"));
		return LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss"));
	};
	
	context.getObjectProperties = function(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				context.logInfo("", key+" = "+obj[""+key]);
			}
		}
	};
	
	//### getTriggeredData ###
	//{d72745cd-1ed1-4eaa-980b-a7b989214b52.state=ON, state=ON, event=Light_UG_Arbeitsraum updated to ON, d72745cd-1ed1-4eaa-980b-a7b989214b52.event=Light_UG_Arbeitsraum updated to ON, module=d72745cd-1ed1-4eaa-980b-a7b989214b52}' 
	//{89bad333-ea88-47f5-9a34-3acdad672950.oldState=OFF, oldState=OFF, module=89bad333-ea88-47f5-9a34-3acdad672950, 89bad333-ea88-47f5-9a34-3acdad672950.event=Light_UG_Arbeitsraum changed from OFF to ON, 89bad333-ea88-47f5-9a34-3acdad672950.newState=ON, event=Light_UG_Arbeitsraum changed from OFF to ON, newState=ON}' 
	//{2ff317ad-e3c1-4f3e-b1fe-f7fec99b7c4c.event=Item 'Light_UG_Arbeitsraum' received command ON, 2ff317ad-e3c1-4f3e-b1fe-f7fec99b7c4c.command=ON, event=Item 'Light_UG_Arbeitsraum' received command ON, command=ON, module=2ff317ad-e3c1-4f3e-b1fe-f7fec99b7c4c}' 
	context.getTriggeredData = function(input) {
		
		//https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
		//context.logInfo(typeof input);
		//context.logInfo(typeof input === "function");
		//context.logInfo(typeof input === "boolean");
		//context.logInfo(typeof input === "string");
		//context.logInfo(typeof input === "number");
		//context.logInfo(typeof input === "symbol");
		//context.logInfo(typeof input === "undefined");
		//context.logInfo(typeof input === "object");
		//context.logInfo("isEmpty: JSON.stringify(obj)="+JSON.stringify(input));
		//context.logInfo("isEmpty: JSON.stringify(obj)="+JSON.parse(input));
		//context.logInfo(isEmpty(input));
		
		context.logInfo("input", input);
		//Item 'Light_UG_Arbeitsraum' received command OFF'
		//Light_UG_Arbeitsraum updated to OFF'
		//Light_UG_Arbeitsraum changed from ON to OFF
		//context.logInfo("event",input.get("event"));
		var ev = input.get("event")+"";
		
		//Light_UG_Arbeitsraum received command OFF
		//Light_UG_Arbeitsraum updated to OFF
		//Light_UG_Arbeitsraum changed from ON to OFF
		context.logInfo("event",ev.split("'").join("").split("Item ").join("").split(" "));
		
		var evArr = [];
		if(context.strIncludes(ev, "triggered")){
			var atmp = ev.split(" triggered "); //astro:sun:local:astroDawn#event triggered START
			evArr = [atmp[0], "triggered", atmp[1]];
		}else{
			evArr = ev.split("'").join("").split("Item ").join("").split(" "); //Item 'benqth681_switch' received command ON
		}
		
		//context.logInfo("size",input.size());
		//context.logInfo("isEmpty",input.isEmpty());
		//[18f2af96-36fc-4212-be9d-1a2862b34883.command, 18f2af96-36fc-4212-be9d-1a2862b34883.event, event, command, module]
		//[0529f579-8ee5-4046-95da-57bd02db859e.state, 0529f579-8ee5-4046-95da-57bd02db859e.event, state, event, module]
		//[0cc5cb66-9aff-4fe0-b071-9d560aaabc8f.event, 0cc5cb66-9aff-4fe0-b071-9d560aaabc8f.oldState, 0cc5cb66-9aff-4fe0-b071-9d560aaabc8f.newState, oldState, module, event, newState]
		//context.logInfo("keySet",input.keySet());

		var d = {
			//size: 		input.size(),
			oldState:	input.get("oldState")+"",
			newState:	input.get("newState")+"",
			receivedCommand:	null,
			receivedState:		null,
			receivedTrigger:	null,
			itemName:	evArr[0]
		};
		

		//TODO: ChannelEventTrigger
		//TODO: stateCondition = ItemStateCondition; 
		//TODO: GenericCompareCondition
		//SEE Dokumentation: http://localhost:8080/rest/module-types

		// {"oldState":null,"newState":null,"receivedState":null,"itemName":"KNX_HFLPB100ZJ200_White","eventType":"command","triggerType":"CommandEventTrigger"}'
		//TODO FOR -> CommandEventTrigger("benqth681_switch")
		//{53d3b7d3-9a57-4973-b3b0-5a80dc83cc56-irTrans-js.event=Item 'benqth681_switch' received command ON, event=Item 'benqth681_switch' received command ON, command=ON, 53d3b7d3-9a57-4973-b3b0-5a80dc83cc56-irTrans-js.command=ON, module=53d3b7d3-9a57-4973-b3b0-5a80dc83cc56-irTrans-js}
		//{53d3b7d3-9a57-4973-b3b0-5a80dc83cc56-irTrans-js.event=Item 'benqth681_switch' received command OFF, event=Item 'benqth681_switch' received command OFF, command=OFF, 53d3b7d3-9a57-4973-b3b0-5a80dc83cc56-irTrans-js.command=OFF, module=53d3b7d3-9a57-4973-b3b0-5a80dc83cc56-irTrans-js}
		//{4be43522-4fd5-41f3-b12e-018c4376b1fc-astro-js.event=astro:sun:local:astroDawn#event triggered START, event=astro:sun:local:astroDawn#event triggered START, module=4be43522-4fd5-41f3-b12e-018c4376b1fc-astro-js}
		switch (evArr[1]) {
			case "received":
				d.eventType = "command";
				d.triggerType = "ItemCommandTrigger";
				d.receivedCommand = input.get("command")+"";
				break;
			case "updated":
				d.eventType = "update";
				d.triggerType = "ItemStateUpdateTrigger";
				d.receivedState = input.get("state")+"";
				break;
			case "changed":
				d.eventType = "change";
				d.triggerType = "ItemStateChangeTrigger";
				break;
			case "triggered":
				d.eventType = "triggered";
				d.triggerType = "ChannelEventTrigger";
				d.receivedTrigger =	evArr[2];
				break;
			default:
				if(input.size() == 0){
					d.eventType = "time";
					d.triggerType = "GenericCronTrigger";
					d.triggerTypeOld = "TimerTrigger";
				}else{
					d.eventType = "";
					d.triggerType = "";
				}
		}		
		return d;
	};	
		
	//### getActions ###
	context.getActions = function() {
		/*
		if(actions == null){
			actions = {};
			var services = ScriptServiceUtil.getActionServices();
			if (services != null) {
				for (var actionService in services) {
					var cn = services[actionService].getActionClassName();
					var cl = services[actionService].getActionClass();
					var className = cn.substring(cn.lastIndexOf(".") + 1);
					actions[className] = cl;
					//logWarn(className + " = " + actions[className]);
				}
			}
		}
		
		FUNKTIONIRT IN OH2:
		var XMP = ScriptServiceUtil.actionServices[6].getActionClass();//.getConstructor().newInstance();
		logInfo("################ "+me+" Line: "+__LINE__+"  #################|"+XMP.static.sendXMPP("helmutl@lewi-cleantech.net","vvvvvvvvvvv"));
		
		//OLD
		if(actions == null){
			actions = [];
			var services = ScriptServiceUtil.getActionServices();
			if (services != null) {
				for (var actionService in services) {
					var cn = services[actionService].getActionClassName();
					var className = cn.substring(cn.lastIndexOf(".") + 1);
					actions[actionService] = className;
				}
			}
		}*/
		if(actions == null){
			actions = {};
			var services = ScriptServiceUtil.getActionServices();
			if (services != null) {
				for (var actionService in services) {
					var cn = services[actionService].getActionClassName();
					var className = cn.substring(cn.lastIndexOf(".") + 1);
					actions[className] = services[actionService];
					actionList[actionService] = className;
				}
			}
		}
		logInfo("actions = " + actions);
		logInfo("actionList = " + actionList);
		return actions;
	};
	context.getActionList = function(str) {
		if(actions == null){
			actions = getActions();
		}
		return actionList;
	};
	context.getAction = function(str) {
		if(actions == null){
			actions = getActions();
		}
		return actions[str].getActionClass();
	};
	
	//### ExecUtil ###
	context.executeCommandLine = function(commandLine) {
		if(commandLine == null || commandLine == "" ){
			return null;
		}
		return ExecUtil.executeCommandLine(commandLine);
	};
	context.executeCommandLineAndWaitResponse = function(commandLine, timeout) {
		if(commandLine == null || commandLine == "" ){
			return null;
		}
		return ExecUtil.executeCommandLineAndWaitResponse(commandLine, timeout);
	};



	/**
	 * SIEHE ### getActions ### in helper.js
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
	//### HttpUtil ###
	//FROM: C:\dev\workspace\Lewi_20150721\clones\lc\lewienergy-build\bundles\lewienergy-actions\src\main\java\com\lewicleantech\lewienergy\openhab\action\util\Lewi.java
	//static public String sendHttpPostRequest(String url, String contentType, String content, int timeout) { 
	//	//return HttpUtil.executeUrl("POST", url, null, IOUtils.toInputStream(content), contentType, timeout, null); 
	//	return HttpUtil.executeUrl("POST", url, null, IOUtils.toInputStream(content), contentType, timeout); 
	//}
	//var wundergr = getAction("Lewi").static.sendHttpPostRequest(posturl, header, "", timeout);

	context.HttpUtil = HttpUtil;
	//sendHttpGetRequest(String url): Sends an GET-HTTP request and returns the result as a String
	context.sendHttpGetRequest = function(url, timeout) {
		//logInfo("arguments = " + arguments, arguments.length);
		return context.executeUrl("GET", url, timeout);
	};
	//sendHttpPutRequest(String url, Sting contentType, String content): Sends a PUT-HTTP request with the given content and returns the result as a String
	//sendHttpPutRequest(String url): Sends a PUT-HTTP request and returns the result as a String
	context.sendHttpPutRequest = function(url, timeout) {
		return context.executeUrl("PUT", url, timeout);
	};
    //sendHttpPostRequest(String url, String contentType, String content): Sends a POST-HTTP request with the given content and returns the result as a String
	//sendHttpPostRequest(String url): Sends a POST-HTTP request and returns the result as a String
	context.sendHttpPostRequest = function(url, timeout) {
		return context.executeUrl("POST", url, timeout);
	};
    //sendHttpDeleteRequest(String url): Sends a DELETE-HTTP request and returns the result as a String
	context.sendHttpDeleteRequest = function(url, timeout) {
		return context.executeUrl("DELETE", url, timeout);
	};
	context.executeUrl = function(httpMethod, url, timeout) {
		if(url == undefined || url == null || url == "" ){ return null; }
		if(timeout == undefined ){ timeout = 5000; }
		return HttpUtil.executeUrl(httpMethod, url, timeout);
	};
	//like getAction("Lewi").static.sendHttpPostRequest(posturl, header, "", timeout); 
	// NOW    => executeUrlPostWithContent(posturl, "", header, timeout);
	// BETTER =>     executeUrlWithContent("POST", posturl, null, "", header, timeout);
	//context.executeUrlPostWithContent = function(url, content, contentType, timeout) {
	//	return context.executeUrlWithContent("POST", url, null, content, contentType, timeout); 
	//};
	//executeUrl(String httpMethod, String url, Properties httpHeaders, InputStream content, String contentType, int timeout) 
	context.executeUrlWithContent = function(httpMethod, url, httpHeaders, content, contentType, timeout) {
		logInfo("httpMethod = " + httpMethod);
		logInfo("url = " + url);
		logInfo("httpHeaders = " + httpHeaders);
		logInfo("content = " + content);
		logInfo("contentType = " + contentType);
		logInfo("timeout = " + timeout);
		if(httpMethod == undefined || httpMethod == null){ httpMethod = "POST"; }
		if(url == undefined || url == null || url == "" ){ return null; }
		if(httpHeaders == undefined ){ httpHeaders = null; }
		if(content == undefined || content == null ){ content = ""; }
		if(contentType == undefined || contentType == null ){ contentType = ""; }
		if(timeout == undefined || timeout == null ){ timeout = 5000; }
		return HttpUtil.executeUrl(httpMethod, url, httpHeaders, IOUtils.toInputStream(content), contentType, timeout); 
	};
	
	/** STRING FUNCTIONS **/
	context.endTrim = function(x) {
		return x.replace(/\s*$/,'');
	}
	context.endTrim = function(x) {
		return x.replace(/^\s+/g, '');
	}
	context.endAndStartTrim = function(x) {
		return x.replace(/^\s+|\s+$/gm,'');
	}
	context.allTrim = function(x) {
		return x.replace(/^\s+|\s+$/gm,'');
	}
	context.strIncludes = function(str, x) {
		return str.indexOf(x) != -1 ? true : false;
	}

	/** JAVA COLLECTION TO ARRAY **/
	context.javaCollectionToArray = function( jCollection){
		try{ 
			//updateIfUninitialized("Vitocom200")
			//var members = getItem("UG").getAllMembers();
			//var members = getItem("Vitocom200").getAllMembers();
			var jsArray = [];
			
			//logInfo("MembersTEST", "##### keys ", Object.keys(members));
			//logInfo("MembersTEST", "##### members ", members["gArbeit"]);
					
			//```javascript
			//https://eclipse.org/smarthome/documentation/javadoc/index.html?org/eclipse/smarthome/core/library/items/class-use/SwitchItem.html
			//NASHORN: https://github.com/EclairJS/eclairjs-nashorn/wiki/Nashorn-Java-to-JavaScript-interoperability-issues
			//logInfo( "javaCollectionToArray class "+  jCollection.class ); 
			//logInfo( "javaCollectionToArray length "+  jCollection.length ); 
			//logInfo( "javaCollectionToArray size "+  jCollection.size ); 
			//logInfo( "javaCollectionToArray size() "+  jCollection.size() ); 
			//logInfo( "javaCollectionToArray [0] "+  jCollection[0] ); 
			//logInfo( "javaCollectionToArray .get(0) "+  jCollection.get ); 
			jCollection.forEach(function(key) {
				//logInfo( "javaCollectionToArray Prints a toString output: "+ key );
				//logInfo( "javaCollectionToArray As everything in JS: "+ typeof key );
				//logInfo( "javaCollectionToArray OpenHAB Item class: "+ key.class );
				//logInfo( "javaCollectionToArray OpenHAB Item Type: "+ key.getType() );
				//logInfo( "javaCollectionToArray Item Name: "+ key.getName() );
				//logInfo( "javaCollectionToArray Item State: "+ key.getState() ); 
				jsArray.push(key);
			});
			return jsArray;
		}catch(err) {
			context.logError("helper.js javaCollectionToArray " + __LINE__ + " Error:" +  err);
		}
		return null;
		
	}
	context.includes = function( obj, val ){
		try{ 
			for (var key in obj) {
				//logInfo( "obj output: "+ key +"="+ obj[key]);
				if(val != undefined && val == key+"")return true;
			};
		}catch(err) {
			context.logError("helper.js includes " + __LINE__ + " Error:" +  err);
			return false;
		}
		return false;
	}

	//### Locals vars/functions
	var actions = null;
	var actionList = [];

	var args = function(a) {
		var um = a.length > 1 ? "\n" : "";
		var s1 = "";
		for(var i in a){
			if(i == 0){
				s1 = "|" + a[i] +"| ";
			}else{
				s1 += um + i + ":'" + a[i] +"' ";
			}
		}
		return s1 + um;
	};
	
	// Is Object empty?
	var isEmpty = function(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop)){
				context.logInfo("isEmpty: prop="+prop);
				return false;
			}
		}
		context.logInfo("isEmpty: JSON.stringify(obj)="+JSON.stringify(obj));
		context.logInfo("isEmpty: JSON.stringify({})="+JSON.stringify({}));
		return JSON.stringify(obj) === JSON.stringify({});
	}

	var isFunction = function(v) {
		if (v instanceof Function) { 
			return true;
		}
		return false
	};
	
	
})(this);

//PARKED

	/* Get Functions of a Class. JAVA version of Reflect 
	//https://stackoverflow.com/questions/1857775/getting-a-list-of-accessible-methods-for-a-given-class-via-reflection
	public static Method[] getAccessibleMethods(Class clazz) {
        List<Method> result = new ArrayList<Method>();

        while (clazz != null) {
            for (Method method : clazz.getDeclaredMethods()) {
                int modifiers = method.getModifiers();
                if (Modifier.isPublic(modifiers) || Modifier.isProtected(modifiers)) {
                    result.add(method);
                }
            }
            clazz = clazz.getSuperclass();
        }

        return result.toArray(new Method[result.size()]);
	}
	*/
	/* Get Functions of a Class. JS Version
	// IT DOES NOT WORK HERE :-(
	context.getAccessibleMethods = function(clazz) {
		try{
			clazz = HttpUtil;
			var result = [];
			while (clazz != null) {
				for (var method in clazz.getDeclaredMethods()) {
					var modifiers = method.getModifiers();
					logInfo("modifiers = " + modifiers);
					if (Modifier.isPublic(modifiers) || Modifier.isProtected(modifiers)) {
						result.push(method);
						logInfo("method = " + method);
					}
				}
				//clazz = clazz.getSuperclass();
			}
			logInfo("result = " + result);
			return result;
		}catch(err) {
			context.logError("helper.js getAccessibleMethods " + __LINE__ + ". clazz: '" + clazz + "' Error:" +  err);
		}
    }
	*/
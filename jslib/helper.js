'use strict';
  
	var mainPath 				= './../conf/automation/jsr223/';
	//https://wiki.shibboleth.net/confluence/display/IDP30/ScriptedAttributeDefinition
	var logger 					= Java.type("org.slf4j.LoggerFactory").getLogger("org.eclipse.smarthome.automation.module.script.rulesupport.internal.shared.SimpleRule");
	var uuid 					= Java.type("java.util.UUID");
	var ScriptExecution 		= Java.type("org.eclipse.smarthome.model.script.actions.ScriptExecution");
	var ScriptServiceUtil 		= Java.type("org.eclipse.smarthome.model.script.ScriptServiceUtil");
	var ExecUtil 				= Java.type("org.eclipse.smarthome.io.net.exec.ExecUtil");
	
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
	var LocalTime 				= Java.type("java.time.LocalTime");
	var Month 					= Java.type("java.time.Month");
	
	//var QuartzScheduler = Java.type("org.quartz.core.QuartzScheduler");
	
	load( mainPath + 'jslib/PersistenceExtensions.js');
	
(function(context) {
  'use strict';	
	context.mainPath 	= mainPath;

	//Todo missing:
	context.UnDefType 	= UnDefType;
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
	context.updateIfUninitialized = function(it, val) {	
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
				return item;
			}
			if( isUninitialized(it) && val != undefined){
				postUpdate( it, val);
				return item;
			}
			return item;
		}catch(err) {
			context.logError("updateIfUninitialized "+__LINE__, err);
			return true;
		} 
		return null;
	};
	
	context.sendMail = function(mail, subject, message) {
		getAction("Mail").static.sendMail(mail, subject, message);
	};
	context.sendXMPP = function(mail, message) {
		getAction("XMPP").static.sendXMPP(mail, message);
	};
	
	context.postUpdate = function(item, value) {
		events.postUpdate((typeof item === 'string' || item instanceof String) ? ir.getItem(item) : item, value);
	};
	
	context.sendCommand = function(item, value) {
		events.sendCommand((typeof item === 'string' || item instanceof String) ? ir.getItem(item) : item, value);
	};
	
	context.createTimer = function(time, runnable) {
		//return QuartzScheduler.createTimer(time, runnable);
		return ScriptExecution.createTimer(time, runnable);
	};
	
	//round(ungerundeter Wert, Stellen nach dem Komma); round(6,66666, 2); -> 6,67
	context.round = function( x, p) { return(Math.round(Math.pow(10, p)*x)/Math.pow(10, p));};
	
	//Java8: 
	//context.now = function() { return LocalTime.now();};
	//Joda for Java 7
	context.now = function() { return DateTime.now();};
	
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
		
		var evArr = ev.split("'").join("").split("Item ").join("").split(" ");
		
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
			itemName:	evArr[0]
		};
		
		// {"oldState":null,"newState":null,"receivedState":null,"itemName":"KNX_HFLPB100ZJ200_White","eventType":"command","triggerType":"CommandEventTrigger"}'
		switch (evArr[1]) {
			case "received":
				d.eventType = "command";
				d.triggerType = "CommandEventTrigger"; //same as ChangedEventTrigger/ItemStateChangeTrigger
				d.receivedCommand = input.get("command")+"";
				break;
			case "updated":
				d.eventType = "update";
				d.triggerType = "UpdatedEventTrigger"; //same as UpdatedEventTrigger/ItemStateUpdateTrigger
				d.receivedState = input.get("state")+"";
				break;
			case "changed":
				d.eventType = "change";
				d.triggerType = "ChangedEventTrigger";	//same as ChangedEventTrigger/ItemStateChangeTrigger
				break;
			default:
				if(input.size() == 0){
					d.eventType = "time";
					d.triggerType = "TimerTrigger";
				}else{
					d.eventType = "";
					d.triggerType = "";
				}
		}		
		return d;
	};	
		
	//### getActions ###
	context.getActions = function() {
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
		}
		logInfo("actions = " + actions);
		return actions;
	};
	context.getAction = function(str) {
		if(actions == null){
			actions = getActions();
		}
		return actions[str];
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
	
	//### Locals vars/functions
	var actions = null;

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
	
	
})(this);
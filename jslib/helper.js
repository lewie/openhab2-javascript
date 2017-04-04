'use strict';
  
	//https://wiki.shibboleth.net/confluence/display/IDP30/ScriptedAttributeDefinition
	var logger = Java.type("org.slf4j.LoggerFactory").getLogger("org.eclipse.smarthome.automation.module.script.rulesupport.internal.shared.SimpleRule");
	var uuid = Java.type("java.util.UUID");
	var ScriptExecution = Java.type("org.eclipse.smarthome.model.script.actions.ScriptExecution");
	//var QuartzScheduler = Java.type("org.quartz.core.QuartzScheduler");
	
	//Time JAVA 7 joda
	var DateTime = Java.type("org.joda.time.DateTime");
	//Time JAVA 8
	var LocalDate = Java.type("java.time.LocalDate");
	var LocalDateTime = Java.type("java.time.LocalDateTime");
	var LocalTime = Java.type("java.time.LocalTime");
	var Month = Java.type("java.time.Month");
	
(function(context) {
  'use strict';	
	//Todo missing:
	context.UnDefType = Java.type("org.eclipse.smarthome.core.types.UnDefType");
	
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
	
	//### getActions ###
	context.getActions = function() {
		if(actions == null){
			actions = {};
			var services = Java.type("org.eclipse.smarthome.model.script.ScriptServiceUtil").getActionServices();
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
		return actions;
	};
	context.getAction = function(str) {
		if(actions == null){
			actions = getActions();
		}
		return actions[str];
	};

	//### Locals Vars
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
	
})(this);
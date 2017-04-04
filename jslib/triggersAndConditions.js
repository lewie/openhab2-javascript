'use strict';
ScriptExtension.importPreset("RuleSupport");
ScriptExtension.importPreset("RuleFactories");

if(HashSet == undefined)var HashSet = Java.type("java.util.HashSet");
if(Visibility == undefined)var Visibility = Java.type("org.eclipse.smarthome.automation.Visibility");
if(TriggerHandler == undefined)var TriggerHandler = Java.type("org.eclipse.smarthome.automation.handler.TriggerHandler");
if(Trigger == undefined)var Trigger = Java.type("org.eclipse.smarthome.automation.Trigger");


// ### StartupTrigger ### DOES NOT WORK!!
var _StartupTriggerHandlerFactory = new TriggerHandlerFactory(){
	get: function(trigger){
		logWarn(" -#### #### #### #### #### get trigger "+__LINE__, trigger); 
		//return _StartupTriggerHandlerFactory.handler(trigger);
		return  new TriggerHandler(){
			setRuleEngineCallback: function(rule_engine_callback){
				logWarn(" -#### TriggerHandler setRuleEngineCallback "+__LINE__, " setRuleEngineCallback ");
				rule_engine_callback.triggered(trigger, {});
			}, 
			dispose: function(){
				logWarn(" -#### TriggerHandler dispose "+__LINE__, " dispose ");
			}
		};
	},
	ungetHandler: function( module, ruleUID, handler){ 
		logWarn(" -#### ungetHandler "+__LINE__, module);
		logWarn(" -#### ungetHandler "+__LINE__, ruleUID);
		logWarn(" -#### ungetHandler "+__LINE__, handler);
	},
	dispose: function(){
		logWarn(" -#### dispose "+__LINE__, " dispose ");
	}
};
var STARTUP_MODULE_ID = "jsr223.StartupTrigger";

automationManager.addTriggerType(new TriggerType(
    STARTUP_MODULE_ID, 
	[],
    "the rule is activated", 
    "Triggers when a rule is activated the first time",
    new HashSet(), 
	Visibility.VISIBLE, 
	[]));
	
automationManager.addTriggerHandler(STARTUP_MODULE_ID, _StartupTriggerHandlerFactory);

var setStartupTrigger = function(triggerName){
	logWarn("#### StartupTrigger "+__LINE__, triggerName);
    triggerName = triggerName ? triggerName : uuid.randomUUID();
	logWarn("#### StartupTrigger "+__LINE__, triggerName);
    return new Trigger(triggerName, "jsr223.StartupTrigger", new Configuration());
}
var StartupTrigger = setStartupTrigger; 


// ### ChangedEventTrigger ###
var setItemStateChangeTrigger = function(itemName, oldState, newState, triggername){
	logWarn("#### ChangedEventTrigger "+__LINE__, triggername);
    var triggerName = triggerName ? triggerName : itemName;
    return new Trigger(triggername, "core.ItemStateChangeTrigger", new Configuration({
        "itemName": itemName,
        "state": newState,
        "oldState": oldState
    }));
}
var ChangedEventTrigger = setItemStateChangeTrigger; 


// ### UpdatedEventTrigger ###
var setItemStateUpdateTrigger = function(itemName, state, triggername){
	logWarn("#### UpdatedEventTrigger "+__LINE__, triggername);
    var triggerName = triggerName ? triggerName : itemName;
    return new Trigger(triggername, "core.ItemStateUpdateTrigger", new Configuration({
        "itemName": itemName,
        "state": state
    }));
}
var UpdatedEventTrigger = setItemStateUpdateTrigger; 


// ### CommandEventTrigger ###
var CommandEventTrigger = function(itemName, command, triggername){
	logWarn("#### CommandEventTrigger "+__LINE__, triggername);
    var triggerName = triggerName ? triggerName : itemName;
    return new Trigger(triggername, "core.ItemCommandTrigger", new Configuration({
        "itemName": itemName,
        "command": command
    }));
}

// ### TimerTrigger ###
//!!!!!!!! timer.GenericCronTrigger !!!!!!!!!!!!!
var setGenericCronTrigger = function(expression, triggername){
    return new Trigger(triggername, "timer.GenericCronTrigger", new Configuration({
        "cronExpression": expression
    }));
}
var TimerTrigger = setGenericCronTrigger; 


// ### stateCondition ###
var setItemStateCondition = function(itemName, state, condName){
    var triggerName = triggerName ? triggerName : itemName;
    return new Condition(condName, "core.ItemStateCondition", new Configuration({
        "itemName": itemName,
        "operator": "=",
        "state": state
    }));
}
var stateCondition = setItemStateCondition; 
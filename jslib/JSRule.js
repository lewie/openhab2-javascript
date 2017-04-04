'use strict';

ScriptExtension.importPreset("RuleSupport");
ScriptExtension.importPreset("RuleSimple");
ScriptExtension.importPreset("RuleFactories");
ScriptExtension.importPreset("default");

load('./automation/jsr223/jslib/helper.js');
load('./automation/jsr223/jslib/triggersAndConditions.js');

//Simplifies spelling for rules.
(function(context) {
  'use strict';
  
	context.JSRule = function(obj) {
		logInfo(" ################  JSRule Line: "+__LINE__+"  #################");
		
		var rule = new SimpleRule(){
			execute: obj.execute
		};
		var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();
		
		//1. Register rule here
		if(triggers && triggers.length > 0){
			rule.setTriggers(triggers);
			automationManager.addRule(rule);
		}
		
		//2. OR second option, to add Rules in rulefile. Is not needed.
		//return rule;
	};
  
})(this);
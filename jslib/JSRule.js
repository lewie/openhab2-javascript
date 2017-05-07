'use strict';

se.importPreset("RuleSupport");
se.importPreset("RuleSimple");
se.importPreset("RuleFactories");
se.importPreset("default");
se.importPreset("media");


load('./../conf/automation/jsr223/jslib/helper.js');
load('./../conf/automation/jsr223/jslib/triggersAndConditions.js');

logInfo(" ################  JSRule Line: "+__LINE__+"  #################");

//Simplifies spelling for rules.
(function(context) {
  'use strict';
  
	context.JSRule = function(obj) {
		logInfo(" ################  JSRule Line: "+__LINE__+"  #################");
		
		var rule = new SimpleRule(){
			execute: obj.execute
		};
		var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();

		if(obj.description){
			rule.setDescription(obj.description);
		}
		if(obj.name){
			rule.setName(obj.name);
		}
		
		//1. Register rule here
		if(triggers && triggers.length > 0){
			rule.setTriggers(triggers);
			automationManager.addRule(rule);
		}
		
		//2. OR second option, to add Rules in rulefile. Is not needed.
		return rule;
	};
  
})(this);
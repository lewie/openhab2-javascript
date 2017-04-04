'use strict';

ScriptExtension.importPreset("RuleSupport");
ScriptExtension.importPreset("RuleSimple");

var sRule = new SimpleRule(){
	execute: function( module, input){
		print("################ module:", module);
		events.postUpdate(ir.getItem("testItemSwitch"), ON);
		events.sendCommand(ir.getItem("testItemSwitch"), OFF);
	}
};

sRule.setTriggers([
		new Trigger(
			"aTimerTrigger", 
			"timer.GenericCronTrigger", 
			new Configuration({
				"cronExpression": "0/15 * * * * ?"
			})
		)
    ]);

//automationManager.addRule(sRule);




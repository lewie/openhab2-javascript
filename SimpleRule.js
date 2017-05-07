'use strict';

scriptExtension.importPreset("RuleSupport");//scriptExtension == se
scriptExtension.importPreset("RuleSimple");

var sRule = new SimpleRule(){
    execute: function( module, input){
        print("Hello World from JavaScript");
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
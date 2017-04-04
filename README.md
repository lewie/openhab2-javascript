# openHAB 2.x: JSR223 JavaScript  Code

This is a repository of very experimental JavaScript code that can be used with the SmartHome platform and openHAB 2.x (after the pending [PR](https://github.com/eclipse/smarthome/pull/1783) has been merged).

## Applications

The JSR223 scripting extensions can be used for general scripting purposes, including defining rules like in openHAB 1.x. So openHAB 1.x JavaScript  Code can be migrated from openHAB 1 JSR223 binding to openHAB 2 automation.

## Defining Rules

One the primary use cases for the JSR223 scripting is to define rules for the [Eclipse SmartHome (ESH) rule engine](http://www.eclipse.org/smarthome/documentation/features/rules.html).

### Rules: Raw ESH API

Using the raw ESH API, the simplest rule definition would look something like:


```JavaScript
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

automationManager.addRule(sRule);
```

This can be simplified with some extra JavaScript Code, found in `jslib/JSRule.js`:

```JavaScript
JSRule({
    triggers: [
        TimerTrigger("0/15 * * * * ?")//Enable/Disable Rule
    ],
    execute: function( module, input){
        print("################ module:", module);
        events.postUpdate(ir.getItem("testItemSwitch"), ON);
        events.sendCommand(ir.getItem("testItemSwitch"), OFF);
    }
});
```

`jslib/helper.js` contains more simplifying and helping functions.

`jslib/triggersAndConditions.js` contains trigger functions.

 


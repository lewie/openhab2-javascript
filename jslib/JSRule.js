'use strict';

se.importPreset("RuleSupport");
se.importPreset("RuleSimple");
se.importPreset("RuleFactories");
se.importPreset("default");

load('/etc/openhab2/automation/jsr223/jslib/helper.js');
load('/etc/openhab2/automation/jsr223/jslib/triggersAndConditions.js');

/*

if(RuleBuilder == undefined)var RuleBuilder = Java.type("org.eclipse.smarthome.automation.core.util.RuleBuilder");

In future better do it by org.eclipse.smarthome.automation.core.util.RuleBuilder like in 
org.eclipse.smarthome.automation.core.dto.RuleDTOMapper Don't know
return RuleBuilder.create(ruleDto.uid)
				.withActions(ActionDTOMapper.mapDto(ruleDto.actions))
                .withConditions(ConditionDTOMapper.mapDto(ruleDto.conditions))
                .withTriggers(TriggerDTOMapper.mapDto(ruleDto.triggers))
                .withConfiguration(new Configuration(ruleDto.configuration))
                .withConfigurationDescriptions(ConfigDescriptionDTOMapper.map(ruleDto.configDescriptions))
				.withTemplateUID(ruleDto.templateUID)
				.withVisibility(ruleDto.visibility)
				.withTags(ruleDto.tags)
				.withName(ruleDto.name)
				.withDescription(ruleDto.description).build();

//  UNTESTED UNTESTED UNTESTED 
//Simplifies spelling for rules.
(function(context) {
	'use strict';
	
	  context.JSRuleNew = function(obj) {
		  //logInfo("################  JSRule Line: "+__LINE__+"  #################");
		  //2. OR second option, to add Rules in rulefile. Is not needed.
		  var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();
		  return RuleBuilder.create( obj.uid ? obj.uid : uuid.randomUUID())
		  .withActions( obj.actions ? obj.actions : null)
		  .withConditions( obj.conditions ? obj.conditions : null)
		  .withTriggers( triggers && triggers.length > 0 ? triggers : null)
		  .withConfiguration(new Configuration(ruleDto.configuration))
		  .withConfigurationDescriptions( obj.configurationDescription ? [obj.configurationDescription] : null)
		  .withTemplateUID( obj.templateUID ? obj.templateUID : null)
		  .withVisibility( obj.visibility ? obj.visibility : null)
		  .withTags( obj.tags ? obj.tags : null)
		  .withName( obj.name ? obj.name : null)
		  .withDescription(obj.description ? obj.description : null)
		  .build();
	  };
	
  })(this);
//  UNTESTED UNTESTED UNTESTED 
*/


//Simplifies spelling for rules.
(function (context) {
	'use strict';

	context.JSRule = function (obj) {
		//logInfo("################  JSRule Line: "+__LINE__+"  #################");
		var rule = new SimpleRule(){
			execute: obj.execute, //DOES THIS WORK? AND IF YES, WHY?
			uid: uuid.randomUUID()
		};
		var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();

		if (obj.description) {
			rule.setDescription(obj.description);
		}
		if (obj.name) {
			rule.setName(obj.name);
		}

		//1. Register rule here
		if (triggers && triggers.length > 0) {
			rule.setTriggers(triggers);
			automationManager.addRule(rule);
		}

		//2. OR second option, to add Rules in rulefile. Is not needed.
		return rule;
	},

	context.JSRuleNew = function (obj) {
		//logInfo("################  JSRule Line: "+__LINE__+"  #################");
		//2. OR second option, to add Rules in rulefile. Is not needed.
		var triggers = obj.triggers ? obj.triggers : obj.getEventTrigger();
		return RuleBuilder.create(obj.uid ? obj.uid : uuid.randomUUID())
			.withActions(obj.actions ? obj.actions : null)
			.withConditions(obj.conditions ? obj.conditions : null)
			.withTriggers(triggers && triggers.length > 0 ? triggers : null)
			.withConfiguration(new Configuration(ruleDto.configuration))
			.withConfigurationDescriptions(obj.configurationDescription ? [obj.configurationDescription] : null)
			.withTemplateUID(obj.templateUID ? obj.templateUID : null)
			.withVisibility(obj.visibility ? obj.visibility : null)
			.withTags(obj.tags ? obj.tags : null)
			.withName(obj.name ? obj.name : null)
			.withDescription(obj.description ? obj.description : null)
			.build();
	}
	
}) (this);
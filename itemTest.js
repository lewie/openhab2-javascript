'use strict';
load('/etc/openhab2/automation/jsr223/jslib/JSRule.js');

var me = "itemTest.js";
logInfo("################# "+me+" ##################");

//var count=0;

JSRule({
	name: me+" L"+__LINE__,
	description: "Set Items"+__LINE__,
	triggers: [ 
		TimerTrigger("0/5 * * * * ?")//, //alle 15 sec
		//TimerTrigger("0/15 * * * * ?"), //alle 15 sec
		//TimerTrigger("0 0/5 * * * ?"), //alle 5 Minuten
		//TimerTrigger("53 0 8 * * ?") //8:00:53
	],
	execute: function( module, input){
		logInfo("################ "+me+" Line: "+__LINE__+"  #################");
		//logInfo("################ postUpdate:",postUpdate);
		//logInfo("################ sendCommand:",sendCommand);
		//logInfo("################ events.sendCommand:",events.sendCommand);
        //logInfo("################ events.storeStates:",events.storeStates);
        
        //https://community.openhab.org/t/curl-and-executecommandline/27184
        //var image = executeCommandLineAndWaitResponse("bash "+ automationPath + "getImage.sh https://loremflickr.com/320/240&"+count++, 5000);
        //var currentPath = executeCommandLineAndWaitResponse("bash " + automationPath + "getFolder.sh", 1000);
		//logInfo("################ currentPath:"+currentPath);
		//logInfo("################ OFF:",OFF);
		//logInfo("################ PREVIOUS,PAUSE,PLAY,NEXT:",PREVIOUS,PAUSE,PLAY,NEXT);
		//logInfo("################ UP,DOWN,STOP:",UP,DOWN,STOP);
		//logInfo("################ OpenClosedType:",OpenClosedType);
		//logInfo("################ OPEN,CLOSE:",OPEN,CLOSED);
		//logInfo("################ HSBType:",HSBType);
		//logInfo("################ PercentType:",PercentType);
		//logInfo("################ StringListType:",StringListType);
		//logInfo("################ CallType:",CallType);// old oh1 style does not work anymore
		//logInfo("################ Color_Item:",updateIfUninitialized("Color_Item"));

        //https://community.openhab.org/t/type-conversions/32684

        //## Call //ONLY postUpdate?!
        //var sl = new StringListType("017922398##0919162558");
        var sl = new StringListType("017922398,0919162558");
        postUpdate("Call_Item", ["017922399","0919162559"] );
        postUpdate("Call_Item", "017922398,0919162558" );
        postUpdate("Call_Item", sl );

        //################
        //## Color
        var h = new DecimalType(11.0);
		var s = new PercentType(77);
        var v = new PercentType(99);
        var hsv = new HSBType(h,s,v);
		sendCommand("Color_Item", hsv);
		sendCommand("Color_Item", new PercentType(getRandom100()));
		sendCommand("Color_Item", OFF);
		sendCommand("Color_Item", new HSBType(getRandom100() + "," + getRandom100() + "," + getRandom100()));//as String
		sendCommand("Color_Item", new PercentType(getRandom100()+""));//as String
        sendCommand("Color_Item","ON");//as String
        //Example for conversion to 8-bit representation
        var Color_Item = getItem("Color_Item");
        var hsvs = new HSBType( Color_Item.state );
        logInfo("################ Color_Item.state:", Color_Item.state);
        var red   = Math.round(hsvs.red * 2.55);
        var green = Math.round(hsvs.green * 2.55);
        var blue  = Math.round(hsvs.blue * 2.55);
        logInfo("################  red, green, blue:", red + "," + green + "," + blue);
    
        //################
        //## Contact
     	postUpdate("Contact_Item", getRandom2str([OPEN,CLOSED]));

         //################
        //## DateTime 
        //Format: '2018-09-11T11:21:17.029+0200'
        postUpdate("DateTime_Item", isoDateTimeString());

        //################
        //## Dimmer
        postUpdate("Dimmer_Item", getRandom100());

        //################
        //## Group
        //postUpdate("Group_item", "");

        //################
        //## Image
        //postUpdate("Image_item", "");

        //################
        //## Location
        postUpdate("Location_Item", new PointType("52.5200066,13.4049540"));

        //################
        //## Number
        postUpdate("Number_Item", getRandom100());

        //################
        //## Player
        sendCommand("Player_Item", getRandom4str([PREVIOUS,PAUSE,PLAY,NEXT]));

        //################
        //## Rollershutter
        sendCommand("Rollershutter_Item", getRandom4str([UP,DOWN,STOP,getRandom100()]));

        //################
        //## String
        postUpdate("String_Item", getRandom2str(["str1","str2"]));

        //################
        //## Switch
        postUpdate("Switch_Item", getRandom2str([ON,OFF]));	
	}
});

var getRandom254 = function(){
    return Math.floor(Math.random() * 255);
}
var getRandom100 = function(){
    return Math.floor(Math.random() * 100);
}

var getRandom2str = function(str){
    return Math.random() > 0.5 ? str[0] : str[1];
}
var getRandom4str = function(str){
    return Math.random() > 0.5 ? getRandom2str([str[0], str[1]]) : getRandom2str([str[2], str[3]]);
}

/* itemsTest.items
Group gItemTest
Group gItems (gItemTest)
Group gGroups (gItemTest)

// SwiGroup
Group 						SwiGroup 			"SwiGroup [(%d)]" 			(gItemTest)
Switch 						SwiGroup_Switch_1 	"SwiGroup_Switch_1 [(%d)]"	(SwiGroup)
Switch 						SwiGroup_Switch_2 	"SwiGroup_Switch_2 [(%d)]"	(SwiGroup)
Switch 						SwiGroup_Switch_3 	"SwiGroup_Switch_3 [(%d)]"	(SwiGroup)
			
// NumGroup		
Group						NumGroup			"NumGroup [%.1f]" 			(gItemTest)
Number 						NumGroup_Number_1 	"NumGroup_Number_1 [%.1f]"	(NumGroup)
Number 						NumGroup_Number_2 	"NumGroup_Number_2 [%.1f]"	(NumGroup)
Number 						NumGroup_Number_3 	"NumGroup_Number_3 [%.1f]"	(NumGroup)
			
// StrGroup		
Group						StrGroup 			"StrGroup [%s]"				(gItemTest)
String 						StrGroup_String_1 	"StrGroup_String_1 [%s]"	(StrGroup)
String 						StrGroup_String_2 	"StrGroup_String_2 [%s]"	(StrGroup)
String 						StrGroup_String_3 	"StrGroup_String_3 [%s]"	(StrGroup)
			
// MixGroup		
Group 						MixGroup 			"MixGroup [%s]"				(gItemTest)
Number 						MixGroup_Number_1 	"MixGroup_Number_1 [%s]"	(MixGroup)
String 						MixGroup_String_2 	"MixGroup_String_2 [%s]"	(MixGroup)
Switch 						MixGroup_Switch_3 	"MixGroup_Switch_3 [%s]"	(MixGroup)

Number 						fastenWriteTest 	"fastenWriteTest [%s]"	    (MixGroup)
Number 						fastenWriteTest2 	"fastenWriteTest [%s]"	    (MixGroup)

//https://www.openhab.org/docs/configuration/items.html#item-definition-and-syntax
//
//itemtype itemname "labeltext [stateformat]" <iconname> (group1, group2, ...) ["tag1", "tag2", ...] {bindingconfig}
//
//Color 			Color information (RGB) 	OnOff, IncreaseDecrease, Percent, HSB
//Contact 		Status of contacts, e.g. door/window contacts. Does not accept commands, only status updates. 	OpenClosed
//DateTime 		Stores date and time 	-
//Dimmer 			Percentage value for dimmers 	OnOff, IncreaseDecrease, Percent
//Group 			Item to nest other items / collect them in groups 	-
//Image 			Binary data of an image 	-
//Location 		GPS coordinates 	Point
//Number 			Values in number format 	Decimal
//Player 			allows control of players (e.g. audio players) 	PlayPause, NextPrevious, RewindFastforward
//Rollershutter 	Roller shutter Item, typicgally used for blinds 	UpDown, StopMove, Percent
//String 			Stores texts 	String
//Switch 			Switch Item, used for anything that needs to be switched ON and OFF 	OnOff

Call			Call_Item 				"Call_Item"				(gItems, gItemTest)	//{ channel="" }
Color			Color_Item 				"Color_Item"			(gItems, gItemTest)	//{ channel="" }
Contact 		Contact_Item 			"Contact_Item"			(gItems, gItemTest)	//{ channel="" }
//DateTime 		DateTime_Item 			"DateTime_Item [%1$tA, %1$td.%1$tm.%1$tY %1$tH:%1$tM:%1$tS]"	(gItems, gItemTest)	{ channel="ntp:ntp:de:dateTime" }
DateTime 		DateTime_Item 			"DateTime_Item [%1$tA, %1$td.%1$tm.%1$tY %1$tH:%1$tM:%1$tS]"	(gItems, gItemTest)
Dimmer 			Dimmer_Item 			"Dimmer_Item"			(gItems, gItemTest)	//{ channel="" }
Group 			Group_item 				"Group_item"			(gItems, gItemTest)	//{ channel="" }
Image 			Image_item 				"Image_item"			(gItems, gItemTest)	//{ channel="" }
Location 		Location_Item 			"Location_Item"			(gItems, gItemTest)	//{ channel="" }
Number 			Number_Item 			"Number_Item"			(gItems, gItemTest)	//{ channel="" }
Player 			Player_Item 			"Player_Item"			(gItems, gItemTest)	//{ channel="" }
Rollershutter 	Rollershutter_Item 		"Rollershutter_Item"	(gItems, gItemTest)	//{ channel="" }
String 			String_Item 			"String_Item"			(gItems, gItemTest)	//{ channel="" }
Switch 			Switch_Item 			"Switch_Item"			(gItems, gItemTest)	//{ channel="" }

	//	//sqlTypes.put("CgItemTestITEM", 		"VARCHAR(20000)");	//uses default StringType
	//	sqlTypes.put("COLORITEM", 		"VARCHAR(70)");
	//	sqlTypes.put("CONTACTITEM", 	"VARCHAR(6)");
	//	sqlTypes.put("DATETIMEITEM", 	"DATETIME");
	//	sqlTypes.put("DIMMERITEM", 		"TINYINT");
	//	//sqlTypes.put("GROUPITEM", 	"DOUBLE"); 			//if GroupItem:<ItemType> is not defined in *.items using StringType
	//	//sqlTypes.put("LOCATIONITEM", 	"VARCHAR(20000)");	//uses default StringType
	//	sqlTypes.put("NUMBERITEM", 		"DOUBLE");
	//	sqlTypes.put("ROLERSHUTTERITEM","TINYINT");
	//	sqlTypes.put("STRINGITEM", 		"VARCHAR(20000)");
	//	sqlTypes.put("SWITCHITEM", 		"CHAR(3)");

Group:Call				gCallGroup 				"gCallGroup"			(gGroups, gItemTest)
Group:Color				gColorGroup 			"gColorGroup"			(gGroups, gItemTest)
Group:Contact 			gContactGroup 			"gContactGroup"			(gGroups, gItemTest)
Group:DateTime 			gDateTimeGroup 			"gDateTimeGroup"		(gGroups, gItemTest)
Group:Dimmer 			gDimmerGroup 			"gDimmerGroup"			(gGroups, gItemTest)
//Group:Group 			gGroupGroup 			"gGroupGroup"			(gGroups, gItemTest)
Group:Image 			gImageGroup 			"gImageGroup"			(gGroups, gItemTest)
Group:Location 			gLocationGroup 			"gLocationGroup"		(gGroups, gItemTest)
Group:Number 			gNumberGroup 			"gNumberGroup"			(gGroups, gItemTest)
Group:Player 			gPlayerGroup 			"gPlayerGroup"			(gGroups, gItemTest)
Group:Rollershutter 	gRollershutterGroup 	"gRollershutterGroup"	(gGroups, gItemTest)
Group:String 			gStringGroup 			"gStringGroup"			(gGroups, gItemTest)
Group:Switch 			gSwitchGroup 			"gSwitchGroup"			(gGroups, gItemTest)

*/


/* itemsTest.sitemap
sitemap itemTest label="Show all Items" {
    Frame label="Call, DateTime, Contact, DateTime, Dimmer, Number, Player, Rollershutter, String, Switch" {
        Default     item=Call_Item      label="Call_Item [%s]"
        Colorpicker item=Color_Item     label="Color_Item [%s]"
        Default     item=Contact_Item   label="Contact_Item [%s]"
        Default     item=DateTime_Item
        Default     item=Dimmer_Item
        Default     item=Number_Item    label="Number_Item [%s]"
        Default     item=Player_Item
        Default     item=Rollershutter_Item
        Text        item=String_Item    label="String_Item [%s]"
        Default     item=Switch_Item
    }
    Frame label="Group" {
        Default     item=Group_Item     label="Group_Item [%s]"
    }
    Frame label="Image" { 
        Image       item=Image_item     url="http://loremflickr.com/320/240" label="Image_item [%s]"
    }
    Frame label="Map/Location" {
        Mapview     item=Location_Item  icon=movecontrol height=10
    }
    Frame label="Demo" {
        Group item=gItems
        Group item=gGroups
        Group item=SwiGroup
        Group item=NumGroup
        Group item=StrGroup
        Group item=MixGroup
    }
}
*/
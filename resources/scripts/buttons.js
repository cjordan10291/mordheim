
var attributeTypeLookup= { 
		strength: "physical",
		toughness: "physical",
		agility: "physical",
		leadership: "mental",
		intelligence: "mental",
		alertness: "mental",
		weapon_skill: "martial",
		ballistic_skill:  "martial",
		accuracy:  "martial"
};

//var activeSkills = {};

//var passiveSkills = {};

var timers = {};

var currentBuild = { activeSkills: {}, passiveSkills: {}, attributes: {} };


function buildContainsSkill(skillName)
{
	if (! (typeof currentBuild.activeSkills[skillName] === 'undefined'))
	{
		return true;
	}
	else if ( !(typeof currentBuild.passiveSkills[skillName] === 'undefined'))
	{
		return true;
	}
	return false;
}



function setActiveSkillSelectorOptions(elemId, selectedOption=null)
{	setSkillSelectorOptions(elemId, "active");
}



function setSkillSelectorOptions(elemId, skillTypeString)
{
	var elem=$("select#"+elemId);
	elem.children().remove();
	elem
	.append($("<option></option>")
			.attr("value",0)
			.text("Select Skill"));

	$.each(jsonData.skills[skillTypeString], function (idx, obj){
		
		if (  ! buildContainsSkill(idx)  )
		{
			if (
					(jsonData.skills[skillTypeString][idx].type === "basic" ) 
				||  ($.inArray(jsonData.skills[skillTypeString][idx].type, currentProfile.restrictions.skills) !== -1	)
			
			   )
			{
					elem
					.append($("<option></option>")
							.attr("value",idx)
							.text(obj.name));
			}
		}
	});
	
}



function generateActiveSkillListSelector(skillName)
{
	return generateSkillListSelector(skillName, 'active')
}

function generateSkillListSelector(skillName,skillTypeString)
{
	
	return "<select " +  ((null == skillName ) ? "" : generateIdTag(skillName, "_" + skillTypeString+"skillselector") )+ "><select>";
	
}


function generateString()
{
	var retval="";
	for (let i=0; i < arguments.length; i++ )
	{
		retval=retval+arguments[i];
	}
	return retval;
}

function generateIdTag(prefix, suffix)
{
	return generateString("id='", prefix, suffix, "'");
}


// Active Skill Row stuff




function deleteSkill(skillName, skillTypeString)
{
	delete currentBuild[skillTypeString+"Skills"][skillName];
	$("tr#" + skillName + "_row").remove();
	updateSkillTotals();
	updateSkillPointTotals();
}


function updateSkillPointTotals()
{
	$("#remaining_skill_points").text(
			currentProfile.skillpoints - getTotalUsedSkillPoints());
}

function getTotalUsedSkillPoints()
{
	var usedPointTotal = 0;

	$.each(currentBuild.activeSkills, function (idx, obj) {
		if (obj === 'basic')
		{
			usedPointTotal = usedPointTotal 
				+ jsonData.skills.active[idx].cost.basic;
		}
		else if (obj === 'mastery') 
		{
			usedPointTotal = usedPointTotal 
			+ jsonData.skills.active[idx].cost.basic;
			usedPointTotal = usedPointTotal 
			+ jsonData.skills.active[idx].cost.mastery;
		}
	});
	
	$.each(currentBuild.passiveSkills, function (idx, obj) {
		if (obj === 'basic')
		{
			usedPointTotal = usedPointTotal 
				+ jsonData.skills.passive[idx].cost.basic;
		}
		else if (obj === 'mastery') 
		{
			usedPointTotal = usedPointTotal 
			+ jsonData.skills.passive[idx].cost.basic;
			usedPointTotal = usedPointTotal 
			+ jsonData.skills.passive[idx].cost.mastery;
		}
	});
	
	return usedPointTotal;
	
}

function generateRemovableActiveSkillTableRow(skillName, skillLevel)
{
	return	"<tr " +generateIdTag(skillName, "_row") + ">"+
	 "<td "
	       +generateIdTag(skillName, "_remove") + ">" +
	       "<button type='button' " + generateIdTag(skillName,"_removebutton") +">Remove</button></td>"
	  	 + "<td " + generateIdTag(skillName, "_skillname") + " >" + removeUnderlines(skillName) + "</td>"
	  	 + "<td " + generateIdTag(skillName, "_attrib") + " >" + jsonData.skills.active[skillName].attribute + "</td>"
	+ "<td " + generateIdTag(skillName, "_requirement") + " >"+ jsonData.skills.active[skillName].requirements[skillLevel] + "</td>"
	+ "<td><select " + generateIdTag(skillName, "_level") + " onChange='changeActiveSkillLevel(this)' >" 
	         + "<option value='basic'" + ((skillLevel == "basic")? " selected=true": "") + ":>Basic</option>"
	         + "<option value='mastery'"+ ((skillLevel == "mastery")? " selected=true": "") +">Mastery</option></select></td>"
	+ "<td " + generateIdTag(skillName, "_pointcost") + ">"
			+ (jsonData.skills.active[skillName].cost.basic + ((skillLevel != "basic" ) ? 
				jsonData.skills.active[skillName].cost.mastery : 0 )
			   )
			+"</td>"
	+ "<td " + generateIdTag(skillName, "_offense") +">"+
	 	((typeof jsonData.skills.active[skillName].info.cost.offense === "undefined") ?
	 			"":jsonData.skills.active[skillName].info.cost.offense)
	 	+"</td>" 
	+ "<td " + generateIdTag(skillName, "_strategy") +">"+
	 	((typeof jsonData.skills.active[skillName].info.cost.strategy === "undefined" ) ?
	 			"":jsonData.skills.active[skillName].info.cost.strategy)
	 	+"</td>" 	
	 	+ "<td class='desccell'><span class='basic_description skillselected' > Basic: "+ jsonData.skills.active[skillName].description.basic + "</span>"  
 		+ ((typeof jsonData.skills.active[skillName].description.mastery === "undefined")?
		 			"" : ( "<p class='mastery_description'>Mastery: " + jsonData.skills.active[skillName].description.mastery + "</p>")
		 			)
		 +"</td>" 
	+ "</tr>";
}


function generateUnremovableActiveSkillTableRowHtml(skillName)
{
	//<td><td> // button to remove, not for this row, though.
	//<td>Skill</td>
	//td>Attribute</td>
	//<td>Requirement</td>
	//<td>Point Cost</td>
	//<td>Offense</td>
	//<td>Strategy</td>
	//<td>Description</td>

	return "<tr " + generateIdTag(skillName, "_row") + " >" 
	 + "<td " + generateIdTag(skillName, "_remove") + "></td>" 
	 + "<td " + generateIdTag(skillName, "_skillname") + " >" + removeUnderlines(skillName) + "</td>" 
	 + "<td " + generateIdTag(skillName, "_attrib") + " ></td>" 
	 + "<td " + generateIdTag(skillName, "_requirement") + " ></td>" 
	 + "<td></td>" 
	 + "<td " + generateIdTag(skillName, "_pointcost") + ">0</td>" 
	 + "<td " + generateIdTag(skillName, "_offense") +">"
	 	+ ((typeof jsonData.skills.active[skillName].info.cost.offense === "undefined") ?
	 			"":jsonData.skills.active[skillName].info.cost.offense)
	 	+"</td>" 
 	+ "<td " + generateIdTag(skillName, "_strategy") +">"
 	+ 	((typeof jsonData.skills.active[skillName].info.cost.strategy === "undefined" ) ?
	 			"":jsonData.skills.active[skillName].info.cost.strategy)
	 	+"</td>" 
 	+ "<td class='desccell'><span class='basic_description'>"+ jsonData.skills.active[skillName].description.basic + "</span>"  
 		+ ((typeof jsonData.skills.active[skillName].description.mastery === "undefined")?
		 			"" : ( "<p class='mastery_description'>" + jsonData.skills.active[skillName].description.mastery + "</p>")
		 			)
		 +"</td>" 
	 + "</tr>";
}




//$("#depositForm").on("change", function(event) { 
//    selectedMainDepositType(this);
//} );


function deleteActiveSkillEvent()
{
	deleteSkill(findBase(this.id), 'active');
}

function deletePassiveSkillEvent()
{
	deleteSkill(findBase(this.id), 'passive');
}

function addRemoveableActiveSkillRow(skillName) {
	$("table#active_skills tbody")
			.append(generateRemovableActiveSkillTableRow(skillName, "basic"));
	$("#"+skillName+"_removebutton").bind("click", deleteActiveSkillEvent);
	setActiveSkillSelectorOptions( skillName+ "_activeskillselector", skillName);
	
};

function addIntrinsicActiveSkillRow(skillName) {
	$("table#active_skills tbody")
			.append(generateUnremovableActiveSkillTableRowHtml(skillName));
};


function setPassiveSkillSelectorOptions(elemId, selectedOption=null)
{	setSkillSelectorOptions(elemId, "passive");
}




function generateUnremovablePassiveSkillTableRowHtml(skillName)
{
	//<td><td> // button to remove, not for this row, though.
	//<td>Skill</td>
	//td>Attribute</td>
	//<td>Requirement</td>
	//<td>Level</td>
	//<td>Point Cost</td>
	//<td>Description</td>
	return "<tr " + generateIdTag(skillName, "_row") + " >" 
	 + "<td " + generateIdTag(skillName, "_remove") + "></td>" 
	 + "<td " + generateIdTag(skillName, "_skillname") + " >" + removeUnderlines(skillName) + "</td>" 
	 + "<td " + generateIdTag(skillName, "_attrib") + " ></td>" 
	 + "<td " + generateIdTag(skillName, "_requirement") + " ></td>" 
	 +"<td></td>"
	 + "<td " + generateIdTag(skillName, "_pointcost") + ">0</td>" 
	+ "<td  class='desccell'><span class='basic_description'>"+ jsonData.skills.passive[skillName].description.basic + "</span>"  
		+ ((typeof jsonData.skills.passive[skillName].description.mastery === "undefined")?
		 			"" : ( "<p class='mastery_description'>" + jsonData.skills.passive[skillName].description.mastery + "</p>")
		 			)
		 +"</td>" 
	 + "</tr>";

}

function generateRemovablePassiveSkillTableRowHtml(skillName, skillLevel)
{
	
	return	"<tr " +generateIdTag(skillName, "_row") + ">"+
	 "<td "
	       +generateIdTag(skillName, "_remove") + ">" +
	       "<button type='button' " + generateIdTag(skillName,"_removebutton") +">Remove</button></td>"
	  	 + "<td " + generateIdTag(skillName, "_skillname") + " >" + removeUnderlines(skillName) + "</td>"
	  	 + "<td " + generateIdTag(skillName, "_attrib") + " >" + jsonData.skills.passive[skillName].attribute + "</td>"
	+ "<td " + generateIdTag(skillName, "_requirement") + " >"+ jsonData.skills.passive[skillName].requirements[skillLevel] + "</td>"
	+ "<td><select " + generateIdTag(skillName, "_level") + " onChange='changePassiveSkillLevel(this)' >" 
	         + "<option value='basic'" + ((skillLevel == "basic")? " selected=true": "") + ":>Basic</option>"
	         + "<option value='mastery'"+ ((skillLevel == "mastery")? " selected=true": "") +">Mastery</option></select></td>"
	+ "<td " + generateIdTag(skillName, "_pointcost") + ">"
			+ (jsonData.skills.passive[skillName].cost.basic + ((skillLevel != "basic" ) ? 
				jsonData.skills.passive[skillName].cost.mastery : 0 )
			   )
			+"</td>"
 	+ "<td class='desccell'><span class='basic_description skillselected' >Basic: "+ jsonData.skills.passive[skillName].description.basic + "</span>"  
		+ ((typeof jsonData.skills.passive[skillName].description.mastery === "undefined")?
		 			"" : ( "<p class='mastery_description'>Mastery: " + jsonData.skills.passive[skillName].description.mastery + "</p>")
		 			)
		 +"</td>" 
	+ "</tr>";

}

function addRemoveablePassiveSkillRow(skillName) {
	$("table#passive_skills tbody")
			.append(generateRemovablePassiveSkillTableRowHtml(skillName, "basic"));
	$("#"+skillName+"_removebutton").bind("click", deletePassiveSkillEvent);
	setPassiveSkillSelectorOptions( skillName+ "_passiveskillselector", skillName);
	
	

};

function addIntrinsicPassiveSkillRow(skillName) {
	$("table#passive_skills tbody")
			.append(generateUnremovablePassiveSkillTableRowHtml(skillName));
};


// Read more:
// http://mrbool.com/how-to-add-edit-and-delete-rows-of-a-html-table-with-jquery/26721#ixzz4N4rTis00


function findBase(id) {
	return id.replace(/_[^_]*?$/, "");
}



function checkGroupConstraints(group)
{
	var totalForAttributeGroup=0;
	var totalMins=0;

	
	$.each($("." + group),function(idx,obj) {
		totalForAttributeGroup=totalForAttributeGroup+parseInt(obj.value);
		totalMins=totalMins+ currentProfile.attributes[findBase(obj.id)].min;
	});

//	alert(group + " TotalAttr:" + totalForAttributeGroup + "  mins:" + totalMins + "  points allowed:"+currentProfile.attributepoints[group]);
	
	if (totalForAttributeGroup - totalMins < currentProfile.attributepoints[group] )
	{
		return true;
	}
	else 
	{
//		alert("failed group constraints");
		return false;
	}
}

function updateGroup(group) {
	var totalForAttributeGroup=0;
	var totalMins=0;

	
	$.each($("." + group),function(idx,obj) {
		totalForAttributeGroup=totalForAttributeGroup+parseInt(obj.value);
		totalMins=totalMins+ currentProfile.attributes[findBase(obj.id)].min;
	});
//	alert("min = " + totalMins + "   current = " + totalForAttributeGroup);
	
	$("#"+group + "_points").text(currentProfile.attributepoints[group]+totalMins-totalForAttributeGroup);
	
}


function checkAttributeConstraints(attributeName, changeValue)
{
	var desiredValue = parseInt($("#" + attributeName + "_value").val()) + changeValue;

	if (desiredValue <= currentProfile.attributes[attributeName].max
			&& desiredValue >= currentProfile.attributes[attributeName].min) 
	{
		return true;
	}
	else
	{
//		alert("Failed attrib validation   desired:" + desiredValue + "   attrib:" + attributeName + "   min/max:" +
//				currentProfile.attributes[attributeName].min + "/" + currentProfile.attributes[attributeName].max);
		return false;
	}

}

function clearValidationMessages()
{
	clearAttributeValidationMessages();
	clearAttributeGroupValidationMessages();
}


function clearAttributeGroupValidationMessages()
{
	$('[id$=groupvalidation]').each( function(idx, labelobj) {
//		alert(labelobj.id);
		// we had to take the reference and get the object via below before we could manipulate it.
		$(labelobj).html("&nbsp;");
	});	
}


function clearAttributeValidationMessages()
{
	
	// clearAttributeValidationMessages
//	$('#strength_attributevalidation').empty();
//	$('#strength_attributevalidation').text("WTF is wrong?");
//	console.log($('[id$=attributevalidation]'));
	$('[id$=attributevalidation]').each( function(idx, labelobj) {
//		alert(labelobj.id);
		// we had to take the reference and get the object via below before we could manipulate it.
		$(labelobj).html("&nbsp;");
	});
	
}



function myAddOnclick(elem) {
	var basename=findBase(elem.id);
	var target=basename + "_value";
	var group="";
	group=attributeTypeLookup[basename];
	
	if (!checkGroupConstraints(group))
	{
		$("#"+group+"_groupvalidation").text("Not enough points left");
	}
	else if  (!checkAttributeConstraints(basename,1))
	{
		$("#"+basename+"_attributevalidation").text("Max is " + currentProfile.attributes[basename].max);
	}
	else 
	{
		$("#" + target).val( parseInt( $("#" + target).val()) + 1);
		currentBuild.attributes[basename]=currentBuild.attributes[basename]+1;
		updateGroup(group);
		clearValidationMessages();
		updateSkillReqs();
	}
		
}

function mySubtractOnclick(elem) {
	var basename=findBase(elem.id);
	var target=basename+"_value";
	if (checkAttributeConstraints(basename,-1))
	{
		$("#" + target).val( parseInt( $("#" + target).val()) - 1);
		currentBuild.attributes[basename]=currentBuild.attributes[basename]-1;
		clearValidationMessages();
		updateGroup(attributeTypeLookup[basename]);
		updateSkillReqs();
	}
	else
	{
		$("#"+basename+"_attributevalidation").text("Min is " + currentProfile.attributes[basename].min);
		$timeoutFade(elementId);
	}
	
}


function findSkillType(skillName)
{
	if (typeof jsonData.skills.active[skillName] !== 'undefined')
	{
		return 'active';
	}
	else if (typeof jsonData.skills.passive[skillName] !== 'undefined')
	{
		return 'passive';
	}
}
function findSkillAttrRequirement(skillName, skillLevel)
{
	var skillType=findSkillType(skillName);
	if ( (typeof jsonData.skills[skillType][skillName].requirements !== 'undefined'))
	{
		
		return  { 	'attr' : jsonData.skills[skillType][skillName].attribute,
			'req' : jsonData.skills[skillType][skillName].requirements[skillLevel] 
		};
	}
	return { 'attr' : 'strength', 'req' : 0 };
}

function setAllSkillReqsMet()
{
	$("tr[id$=_row]").each(function(idx, obj){
		$(obj).removeClass("notmet");
		$(obj).removeClass("impossible");
	});
	
}

function markSkillRequirementNotMet(skillName, attr, skillReq)
{
	var elem=$("tr#"+skillName+"_row");

	if (currentBuild.attributes[attr] < skillReq)
	{
		elem.addClass("notmet");
		
		if (currentProfile.attributes[attr].max < skillReq)
		{
			elem.addClass("impossible");
		}
	}
}

function updateSkillReqs()
{
	setAllSkillReqsMet();
	$.each(["active","passive"], function(idx2,obj2)
	{
		$.each(currentBuild[obj2+"Skills"], function(skillName, skillLevel){
			let skillReq=findSkillAttrRequirement(skillName, skillLevel);
			
			markSkillRequirementNotMet(skillName, skillReq.attr, skillReq.req);
		});
	});
}



function timeOutFade(elementId)
{
	$("#"+elementId).stop(true, true).show();
	
	if ( (typeof timers[elementId] !== "undefined"))
	{
		clearTimeout(timers[elementId]);
	}
		
	timers[elementId] = setTimeout(function() {
		  $("#"+elementId).fadeOut(2000);
		}, 5000);	
}

function unitTypeChanged(element)  {
	loadUnitType(element.value);
}


function updateSkillTotals() 
{
	var slotCount = 5;
	
	$.each(currentBuild.activeSkills, function(idx,obj){slotCount = slotCount - 1 });
	$("#active_slots_left").text(slotCount );
	
	slotCount=5;
	
	$.each(currentBuild.passiveSkills, function(idx,obj){slotCount = slotCount - 1 });
	$("#passive_slots_left").text(slotCount );
	
}


function addSkill(skillName, skillLevel, skillTypeString)
{
	
}


function addActiveSkill(skillName, skillLevel)
{
	var rowToAdd="";
	currentBuild.activeSkills[skillName]= skillLevel;
	if (skillLevel == 'Intrinsic')
	{
		addIntrinsicActiveSkillRow(skillName);
	}
	else
	{
		addRemoveableActiveSkillRow(skillName);
	}
	updateSkillTotals();
	updateSkillPointTotals();
	updateSkillReqs();
}


function addPassiveSkill(skillName, skillLevel)
{
	var rowToAdd="";
	currentBuild.passiveSkills[skillName]= skillLevel;
	if (skillLevel == 'Intrinsic')
	{
		addIntrinsicPassiveSkillRow(skillName);
	}
	else
	{
		addRemoveablePassiveSkillRow(skillName);
	}
	updateSkillTotals();
	updateSkillPointTotals();
	updateSkillReqs();
}

function removeActiveSkill(skillName)
{
	delete activeSkill[skillName];
}

function removePassiveSkill(skillName)
{
	delete passiveSkill[skillName];
}



function loadUnitType(unitType){
	
//	alert(element.value);
	currentProfile=jsonData.profiles[unitType];
	
	currentBuild = { activeSkills: {}, passiveSkills: {}, attributes: {} };
	
	$.each(currentProfile.attributes, function(idx,obj) {
//		alert(idx +"_value " + obj.min);
		$("input#"+ idx + "_value").val(obj.min);
		$("label#"+ idx + "_min").text(obj.min);
		$("label#"+ idx + "_max").text(obj.max);
		currentBuild.attributes[idx]=obj.min;
	});
	
	$.each(currentProfile.attributepoints, function (idx, obj) {
//		alert(idx+"_points " + obj );
		$("#" + idx + "_points").empty().text(obj);
		$("#max_" + idx + "_points").empty().text(obj);
	});
	
	
	$("#total_skill_points").text(currentProfile.skillpoints);
	$("#remaining_skill_points").text(currentProfile.skillpoints);
	
//	activeSkills = {};

	$("table#active_skills tr[id$=_row").each(function (idx, obj){
		$(obj).remove();
	});

	
//	passiveSkills = {};

	$("table#passive_skills tr[id$=_row").each(function (idx, obj){
		$(obj).remove();
	});
	
	
	$.each(currentProfile.skills, function(idx,obj){
		if (!(typeof jsonData.skills.active[obj] === "undefined")) {
		    addActiveSkill(obj, "Intrinsic");
		}
		else
		{	if (!(typeof jsonData.skills.passive[obj] === "undefined")) 
			{
				addPassiveSkill(obj, "Intrinsic");
			}
		}
	});
	
	setActiveSkillSelectorOptions("new_activeskillselector",null);
	setPassiveSkillSelectorOptions("new_passiveskillselector",null);
}


function addNewActiveSkill(newSkill)
{
	addActiveSkill(newSkill, "basic");
	$.each($("select[id$=_activeskillselector]"), function (idx, obj){
		if ("new_activeskillselector" === obj.id)
		{
			setActiveSkillSelectorOptions(obj.id);
		}
		else 
		{
			setActiveSkillSelectorOptions(obj.id, obj.value );
		}
	});
}

function addNewPassiveSkill(newSkill)
{
	addPassiveSkill(newSkill, "basic");
	setPassiveSkillSelectorOptions("new_passiveskillselector");
//	$.each($("select[id$=_passiveskillselector]"), function (idx, obj){
//		if ("new_passiveskillselector" === obj.id)
//		{
//			setPassiveSkillSelectorOptions(obj.id);
//		}
//		else 
//		{
//			setPassiveSkillSelectorOptions(obj.id, obj.value );
//		}
//	});
}



function removeUnderlines(text) {

	return text.replace(/_/g, " ")
	           .replace(/\b[a-z]/g,function(letter, index) { return letter.toUpperCase() });
}

function loadUnitTypeSelectOptions() {
	
	
	$.each(jsonData.profiles, function(idx, obj) {
		$('select#unit_type').append( $("<option>")
				                         .val(idx)
				                         .html(removeUnderlines(idx))
				                    );
	});
	loadUnitType("sigmarite_matriarch");
	
	
	
	
//	$("select#new_activeskillselector").change(function() {
//		  addNewActiveSkill($(this).val());
//		});
	
	
// how to iterate over each physical characteristic (strength/toughtness/agility)	
//	$.each($("input.physical"), function(idx, obj) {
//		alert(obj.id + " " + obj.className);
//	});
	
}


function skillPointCost(skillName,skillTypeString)
{
	var skillLevel = currentBuild[skillTypeString+"Skills"][skillName];

	if ("basic" === skillLevel)
	{
		return jsonData.skills[skillTypeString][skillName].cost.basic;
	}
	else if ("mastery" === skillLevel)
	{
		return jsonData.skills[skillTypeString][skillName].cost.basic
		   + jsonData.skills[skillTypeString][skillName].cost.mastery ;
	}
	else
	{
		return 0;
	}
}


function updateSkillLevelDisplays(skillName, skillTypeString)
{
	$("tr#"+skillName+"_row #"+skillName + "_pointcost").text(skillPointCost(skillName, skillTypeString));
	updateSkillPointTotals(skillTypeString);
}

function changeActiveSkillLevel()
{
	changeSkillLevel('active');
}	

function changePassiveSkillLevel()
{
	changeSkillLevel('passive');
}

function changeSkillLevel(skillType)
{
	var skillNameString=findBase(this.event.target.id);
	
	var skillLevelString=this.event.target.options[this.event.target.selectedIndex].value;
	
	if (skillLevelString === "mastery")
	{
		var addedCost=jsonData.skills[skillType][skillNameString].cost.mastery;
		
		if ( (getTotalUsedSkillPoints() + addedCost ) > currentProfile.skillpoints)
		{
			//TODO pop up some wwarning
		}
	
	}
	
	
	currentBuild[skillType + "Skills"][skillNameString]=skillLevelString;
	$("tr#" + skillNameString +"_row .basic_description").css("font-weight","bold").css("font-size","100%");
	
	if ("intrisic" !== skillLevelString)
	{
		$("tr#" + skillNameString +"_row #"+skillNameString + "_requirement").text(
				jsonData.skills[skillType][skillNameString].requirements[skillLevelString]
				);

	}
	if ("basic" === skillLevelString)
	{
		$("tr#" + skillNameString +"_row .mastery_description").css("font-weight","normal").css("font-size","100%");
	}
	else
	{
		$("tr#" + skillNameString +"_row .mastery_description").css("font-weight","bold").css("font-size","100%");
	}
	updateSkillLevelDisplays(skillNameString, skillType);
	updateSkillReqs();
	
}


function saveBuild()
{
	
	
}

function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else 
  {
	  var expires = "";
  }
  document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function eraseCookie(name) 
{
  createCookie(name,"",-1);
}


// DAZ Studio version 4.21.0.5 filetype DAZ Script

var oGear = Scene.findNodeByLabel('MFF Flame02');
var oGearShape = oGear.getObject().getCurrentShape();
var oMaterial = oGearShape.findMaterial("mFlame");
var oVertProp = oMaterial.findPropertyByLabel("Vertical Offset");
var oHoriProp = oMaterial.findPropertyByLabel('Horizontal Offset');
var aGearProperties = oGear.getPropertyList();

oHoriProp.findMatchingProperty(oGear).linkTo(oHoriProp);
oVertProp.findMatchingProperty(oGear).linkTo(oVertProp);
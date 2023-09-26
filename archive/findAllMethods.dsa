var theNode = Scene.findNodeByLabel('character');

function propsAndMethods(obj) {
	var classInfo = obj.name + " (" + obj.className() + ")";
	var seperator = "";
	for (var i = 0; i < classInfo.length; i++){
		seperator += '_';
	}
	print(seperator);
	print(classInfo);
	print(seperator);
	var properties = new RegExp("([a-zA-Z0-9]+(\\(.*?\\))?),", "g");
	var arr = Object.getOwnPropertyNames(obj).sort();
	for (item in arr){
		print(arr[item].toString().replace(properties, "$1\n"));
	}
}

propsAndMethods(theNode);
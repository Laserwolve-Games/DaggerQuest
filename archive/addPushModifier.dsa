		var offsetModifier = new DzPushModifier(); // a push modifier to apply to characters for the shadow gaping fix
		var subjectObject = theSubject.getObject(); // the subject as an object
		
		subjectObject.addModifier(offsetModifier); // give the subject the push modifier

		var theMod = subjectObject.findModifier('Offset') // find the modifier we just added
		var modProperty = theMod.getValueChannel(); // the property of that mod

		modProperty.setValue(.33); // set it's value accordingly
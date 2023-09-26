// select all the subject's children that are bones, clear the animation, then deselect all the subject's children
for (var i = 0; i != aSubjectChildren.length; i++) if (aSubjectChildren[i].className() == 'DzBone') aSubjectChildren[i].select(true);
MainWindow.getActionMgr().findAction( "DzClearKeysSelectedItemsAction" ).trigger();
for (var i = 0; i != aSubjectChildren.length; i++) if (aSubjectChildren[i].className() == 'DzBone') aSubjectChildren[i].select(false);
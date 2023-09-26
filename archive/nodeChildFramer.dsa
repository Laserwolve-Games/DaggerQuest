// Create a basic dialog box
var nameDialog = DzBasicDialog();
 
// Create a textline widget
var LineWidget = DzLineEdit(nameDialog);
 
// Add the widget to the dialog
nameDialog.addWidget(LineWidget);

// Update the variable to the inputted text on "Accept"
if(nameDialog.exec()){var objectName = LineWidget.text;}

// The name of the overarching set of renders	
var setName = "WitchsCottage"

// Get all the nodes in the scene
var allNodes = Scene.getNodeList();

// Select the fourth node
allNodes[4].select( true );

// Pick the currently selected node
var node = Scene.getPrimarySelection();

// Get the viewport manager
var oViewMgr = MainWindow.getViewportMgr();

// Get the active viewport
var oViewport = oViewMgr.getActiveViewport().get3DViewport();

// get a list of all children and subchildren of the selected node
var allChildren = node.getNodeChildren( true );

// loop through all children and subchildren, selecting them all
for (var childSelector = 0; childSelector < allChildren.length; childSelector++){
	
	allChildren[childSelector].select( true );
	
	}

// Get the active camera
var ElCamera = Scene.findCameraByLabel("isometricCamera");

// Base the render size on the object's size
oViewport.frameCamera();
var renderSizeY = ElCamera.getYPosControl().getValue();
var renderSizeZ = ElCamera.getZPosControl().getValue();

// Use the camera's location as a way to determine how "big" the object is
var renderSquare = Math.round(renderSizeY + renderSizeZ);

// Get the current render engine
var oRenderMgr = App.getRenderMgr();

// Get the current render engine's options
var oRenderOptions = oRenderMgr.getRenderOptions();

// Set the size of the render
oRenderOptions.imageSize = Size(Math.max(renderSquare, 100), Math.max(renderSquare, 100));

// Loop through each of the 8 angles
for (var angle = 0; angle != 8; angle++){
	
		//Rotate the character 45 degrees each run
		node.getYRotControl().setValue(angle * 45);

		// Frame the current camera on the selected nodes
		oViewport.frameCamera();
		
		// Set the file path and file name
		oRenderOptions.renderImgFilename =
		'C:/Users/Andre/Downloads/' + setName + '/' + objectName + '/' + angle + objectName + '.png';

		// Go!
		oRenderMgr.doRender();

	}
	
// Deletes the selected node
Scene.removeNode(node);
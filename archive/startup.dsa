var nTotalNumberOfInstances = App.scriptArgs[0];
var sPath = 'C:/DazStudioScripts/src/startup.bat';
var oFile = new DzFile(sPath);

App.getContentMgr().openFile('C:/assets/templates/masterTemplate.duf', false);

if(nTotalNumberOfInstances)
{
    for (var i = 1; i <= nTotalNumberOfInstances; i++)
    {
        oFile.open(DzFile.WriteOnly);

        oFile.writeLine("\"C:\\Daz 3D\\Applications\\64-bit\\DAZ 3D\\DAZStudio4\\DAZStudio.exe\" -instanceName # -noPrompt -scriptArg " + nTotalNumberOfInstances);
        
        oFile.close();
        
        App.showURL('file:///' + sPath);

        sleep(5000);

        var script = new DzScript();
        script.loadFromFile('C:/DazStudioScripts/src/' + sScript + '.dsa', false);
        script.execute(App.scriptArgs);

        new DzDir('').remove(sPath);
    }

    // Close this instance since we're done with it
    Scene.clear();
    MainWindow.close();
}
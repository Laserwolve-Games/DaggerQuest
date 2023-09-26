var sWebpFilename = sNoExtension + '.webp';
var sWebpCreatorPath = 'C:/DazStudioScripts/src/webpCreator.bat';
var oWebpCreator = new DzFile(sWebpCreatorPath);
var bConvertToWebp = false;


if (bConvertToWebp) if (oCanvasDirectory.exists(sPngFilename))
{
    oWebpCreator.open(oWebpCreator.WriteOnly);  // Open our batch file, write our script, then close it.

    oWebpCreator.writeLine('C:/tools/cwebp.exe -lossless -exact -q 100 -alpha_q 100 -m 6 -mt ' + sPngFilename + ' -o ' + sWebpFilename);

    oWebpCreator.close();

    App.showURL('file:///' + sWebpCreatorPath); // Run the batch script, turning the PNG into a Webp.

    while(new DzFileInfo(sWebpFilename).size() === 0); // Wait until the WebP file has finished being written.

    oCanvasDirectory.remove(sPngFilename); // Delete the PNG version.
}
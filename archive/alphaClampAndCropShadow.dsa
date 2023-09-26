oShadowBatchExecutor.open(DzFile.WriteOnly);

// use a VBScript to execute the alpha threshold modifier batch script silently
oShadowBatchExecutor.writeLine('Set WshShell = CreateObject("WScript.Shell")');
oShadowBatchExecutor.writeLine('WshShell.Run chr(34) & "C:/DazStudioScripts/src/ShadowBatch' + nInstanceNumber + '.bat" & Chr(34), 0');
oShadowBatchExecutor.writeLine('Set WshShell = Nothing');

oShadowBatchExecutor.close();

// clamp its alpha threshold. If the image is then comprised completely of transparent pixels, crop it to 1x1
oShadowBatch.open(DzFile.WriteOnly);
oShadowBatch.writeLine('magick ' + sFinalFilePath + ' -alpha set -channel A -threshold 25%% +channel ' + sFinalFilePath);
oShadowBatch.writeLine("for /f %%i in ('convert " + sFinalFilePath + " -channel a -format %%[fx:mean] info:') DO set ntotalOpacity=%%i");
oShadowBatch.writeLine("if %ntotalOpacity%==0 convert " + sFinalFilePath + " -crop 1x1+0+0 imagePath");
oShadowBatch.close();

App.showURL('file:///' + sShadowBatchExecutorPath);
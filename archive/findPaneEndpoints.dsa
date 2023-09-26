// DAZ Studio version 4.15.0.30 filetype DAZ Script

var oPaneMgr = MainWindow.getPaneMgr();
var oPane = oPaneMgr.findPane( "aniMate" );
if( oPane ){
 var oDefinition;
 var aMembers = [];
 for( var sMember in oPane ){
  oDefinition = oPane[ sMember ];
  switch( typeof( oDefinition ) ){
   case "function":
    aMembers.push( sMember );
    break;
   case "object":
    if( oDefinition.toString().startsWith("[") ){
     aMembers.push( [sMember, "=", oDefinition.className()].join(" ") );
    } else {
     aMembers.push( [sMember, "=", oDefinition].join(" ") );
    }
    break;
   default:
    aMembers.push( [sMember, "=", oDefinition].join(" ") );
    break;
  }
 }
 aMembers.sort();
 print( aMembers.join("\n") );
}
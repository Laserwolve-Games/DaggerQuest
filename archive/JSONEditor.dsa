// Get the JSON file as an object
var oFile = new DzFile('C:/Users/Andre/Downloads/man_character.duf');

// Get the JSON as an object
oFile.open(DzFile.ReadOnly);
var oJSON = JSON.parse(oFile.read());
oFile.close();

// Make all JSON modifications here
oJSON.simpleName = 'man';

// Replace the old JSON with our new JSON
oFile.open(DzFile.Truncate | DzFile.WriteOnly);
oFile.write(JSON.stringify(oJSON, null, "\t"));
oFile.close();
/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.File = function ( editor ) {

	var NUMBER_PRECISION = 6;

	function parseNumber( key, value ) {

		return typeof value === 'number' ? parseFloat( value.toFixed( NUMBER_PRECISION ) ) : value;

	}

	//

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'File' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// New

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'New' );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();
			editor.storage.clear();
			editor.project_uuid = "";
		}

	} );
	options.add( option );

// Load/Resume State
	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Load' );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {
			fetchStates();

			document.getElementById('myModal').style.display = "block";

		}

	} );
	options.add( option );


	//

	options.add( new UI.HorizontalRule() );


	// Aircraft Dimension Variables

    var check = false;                          // set a flag to check if button already pressed

    var l, w, h;                                // initialize length, wingspan, and height variables for inputs
    var input_pane = new UI.Panel();            // create interface elements to display input option
    var l_row = new UI.Row();
    var w_row = new UI.Row();
    var h_row = new UI.Row();
    var input;                                      // initialize general input button

    var text = new UI.Text("Aircraft Dimensions");  // instruction text and spacing
    var text2 = new UI.Text("(in meters)");
	text.setMarginLeft('11px');
    text.setMarginRight('11px');
    text2.setMarginLeft('39px');
    text2.setMarginRight('39px');
    text2.setPaddingBottom('12px');

    var text_l = new UI.Text("Length:").setMarginRight('62px').setMarginLeft('4px');              // input text, area, and spacing
    var text_w = new UI.Text("Wingspan:").setMarginRight('43px').setMarginLeft('4px');
    var text_h = new UI.Text("Height (nose up):").setMarginRight('2px').setMarginLeft('4px');;
    var input_l = new UI.Number().setWidth( '30px' );
    var input_w = new UI.Number().setWidth( '30px' );
    var input_h = new UI.Number().setWidth( '30px' );

    input_pane.add(text);                       // ready all contents to be displayed once added to the main panel
    input_pane.add(text2);
	l_row.add(text_l);
    l_row.add(input_l);
    w_row.add(text_w);
    w_row.add(input_w);
    h_row.add(text_h);
    h_row.add(input_h);
    h_row.setPaddingBottom('15px');
    input_pane.add(l_row);
    input_pane.add(w_row);
    input_pane.add(h_row);


    // Import

	var form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {

		editor.loader.loadFile( fileInput.files[ 0 ] );
		form.reset();

		var color = 0xffffff;                 // create spotlight when new model imported
        var intensity = 1;
        var distance = 0;
        var angle = Math.PI * 0.1;
        var penumbra = 0;

        var light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
        light.name = 'SpotLight';
        light.target.name = 'SpotLight Target';

        light.position.set( 0, 5500, 5000 );

        editor.execute( new AddObjectCommand( light ) );

	} );
	form.appendChild( fileInput );

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Import' );
	option.onClick( function () {

        if (check === true){                     // check if prior button state already displayed
            options.newInput();                  // if so, remove the display
            input_pane.remove(input);
        }
        check = true;                            // set flag to true as new display will populate

        input = new UI.Button();                 // set input button spacing and function
        input.setMarginLeft('42px');
        input.setClass("input");
        input.setTextContent("Enter");
        input.onClick( function () {

            l = input_l.getValue();              // store entered values and set internal model dimensions
            w = input_w.getValue();
            h = input_h.getValue();
            editor.setModelDimensions(l, w, h);

            fileInput.click();                   // import the model

            input_pane.remove(input);    // remove additional input display
            options.newInput();
            check = false;
        } );

        input_pane.add(input);           // add input display to menubar panel
		options.remove(opt1);
		options.remove(opt2);
        options.add(input_pane);

	} );

	options.add( option );
	
	var xmlInput = document.createElement( 'input' );
	xmlInput.type = 'file';
	xmlInput.addEventListener( 'change', function ( event ) {
		
		var filename = (xmlInput.files[ 0 ].name);
		var extension = filename.split( '.' ).pop().toLowerCase();
		
		if(extension === 'xml'){
			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {
				var xmlString = event.target.result;
			
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(xmlString,"text/xml");
				
				AntennasXml = xmlDoc.documentElement;
				antennaList = xmlDoc.documentElement.childNodes;
				
				if(AntennasXml.nodeName === 'Antennas'){
					for(var i = 0; i < antennaList.length; i++) {
						if (antennaList[i].nodeName === 'Antenna') {
							//Default values
							var xCoord = 0;
							var yCoord = 0; 
							var zCoord = 0;
							var xRot = 0;
							var yRot = 0;
							var zRot = 0;
							var name = 'Antenna';
							
							for(var j = 0; j < antennaList[i].childNodes.length; j++) {
								if (antennaList[i].childNodes[j].nodeName === 'Name') {
									name = antennaList[i].childNodes[j].childNodes[0].nodeValue;
								} else if(antennaList[i].childNodes[j].nodeName === 'Coordinates'){
									var coordinates = antennaList[i].childNodes[j].childNodes;
									for(var k = 0; k < coordinates.length; k++){
										if(coordinates.nodeType != 3){
											if(coordinates[k].nodeName === 'X'){
												xCoord = coordinates[k].childNodes[0].nodeValue;
											} else if(coordinates[k].nodeName === 'Y'){
												yCoord = coordinates[k].childNodes[0].nodeValue;
											} else if(coordinates[k].nodeName === 'Z'){
												zCoord = coordinates[k].childNodes[0].nodeValue;
											}
										}
									}
								} else if(antennaList[i].childNodes[j].nodeName === 'Rotation'){
									var rotation = antennaList[i].childNodes[j].childNodes;
									for(var k = 0; k < rotation.length; k++){
										if(rotation.nodeType != 3){
											if(rotation[k].nodeName === 'X'){
												xRot = rotation[k].childNodes[0].nodeValue;
											} else if(rotation[k].nodeName === 'Y'){
												yRot = rotation[k].childNodes[0].nodeValue;
											} else if(rotation[k].nodeName === 'Z'){
												zRot = rotation[k].childNodes[0].nodeValue;
											}
										}
									}
								}
							}
							
							// convert entered values to meters coordinate system		
							var x_nose = editor.getModel()[4];           	
							var x_tail = editor.getModel()[5];
							var x_slope = ( x_nose - x_tail ) / editor.getModelLength();

							var z_nose = editor.getModel()[3];
							var z_tail = editor.getModel()[2];
							var z_slope = ( z_nose - z_tail ) / editor.getModelHeight();

							var right_wing = editor.getModel()[0];
							var left_wing = editor.getModel()[1];
							var y_slope = ( right_wing - left_wing ) / editor.getModelWingspan();

							var xCoord_NG = ( yCoord * y_slope ) + ( left_wing + right_wing ) / 2;
							var yCoord_NG = ( zCoord * z_slope ) + z_nose;
							var zCoord_NG = x_nose + ( xCoord * x_slope );
							
							//covert entered values to meters rotation system
							var xRot_NG = yRot * THREE.Math.DEG2RAD;
							var yRot_NG = zRot * THREE.Math.DEG2RAD;
							var zRot_NG = xRot * THREE.Math.DEG2RAD;
							
							// create sphere object according to model size
							var radius = Math.abs( right_wing - left_wing ) / 180;      
							var widthSegments = 32;
							var heightSegments = 16;
							var phiStart = 0;
							var phiLength = Math.PI * 2;
							var thetaStart = 0;
							var thetaLength = Math.PI;


							var material = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );
							var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );
							for ( var g = 0; g < geometry.faces.length; g++ ){
								var face = geometry.faces[g];
								if ( g < 96 ) {
									face.color.setRGB( 0, 0, 256 );
								}
								else {
									face.color.setRGB( 256, 0, 0 );
								}
							}

							// convert to BufferGeometry type
							var geo = new THREE.BufferGeometry().fromGeometry( geometry );            
							var mesh = new THREE.Mesh( geo, material );
							mesh.name = name;

							// move object to desired coordinates and rotation
							editor.execute( new SetPositionCommand( mesh, new THREE.Vector3( xCoord_NG, yCoord_NG, zCoord_NG ) ) ); 
							editor.execute( new SetRotationCommand( mesh, new THREE.Euler( xRot_NG, yRot_NG, zRot_NG ) ) );
							editor.execute( new AddObjectCommand( mesh ) ); 
						}
					}
				} else {
					alert('Please use Antennas xml file');
				}
				
				
				
				
			
			}, false );
			reader.readAsText( xmlInput.files[ 0 ] );
		} else {
			alert('Unsupported file format (' + extension +  ').');
		}
		form.reset();

	} );
	form.appendChild( xmlInput );
	
	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Import Antennas' );
	option.onClick( function () {

		xmlInput.click();

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	/*
	// Export Geometry

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export Geometry' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		var geometry = object.geometry;

		if ( geometry === undefined ) {

			alert( 'The selected object doesn\'t have geometry.' );
			return;

		}

		var output = geometry.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'geometry.json' );

	} );
	options.add( option );

	*/

	// Export Object
	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export Antennas' );
	option.onClick( function () {
	var output = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
		var objects = editor.scene.children
		
        var right_wing = editor.getModel()[0];              // convert three.js coordinates back to meters for display
        var left_wing = editor.getModel()[1];
        var y_slope = ( right_wing - left_wing ) / editor.getModelWingspan();
		
		var z_nose = editor.getModel()[3];
        var z_tail = editor.getModel()[2];
        var z_slope = ( z_nose - z_tail ) / editor.getModelHeight();
		
		var x_nose = editor.getModel()[4];
        var x_tail = editor.getModel()[5];
        var x_slope = ( x_nose - x_tail ) / editor.getModelLength();
		
		output += "<Antennas>\n"
		for ( var i = 0, l = objects.length; i < l; i ++ ) {
			var object = objects[ i ];
			
			if(object.geometry !== undefined && object.geometry.type === 'BufferGeometry'){
				output += "\t<Antenna>\n";
				output += "\t\t<Name>" + object.name + "</Name>\n";
				
				output += "\t\t<Coordinates>\n";
				output += "\t\t\t<X>" + (Math.round((( object.position.z - x_nose ) / x_slope) * 100) / 100) + "</X>\n";
				output += "\t\t\t<Y>" + (Math.round((( object.position.x - ( left_wing + right_wing ) / 2 ) / y_slope) * 100) / 100) + "</Y>\n";
				output += "\t\t\t<Z>" + (Math.round((( object.position.y - z_nose ) / z_slope) * 100) / 100) + "</Z>\n";
				output += "\t\t</Coordinates>\n";
				
				output += "\t\t<Rotation>\n";
				output += "\t\t\t<X>" + (Math.round((object.rotation.z * THREE.Math.RAD2DEG) * 100) / 100) + "</X>\n";
				output += "\t\t\t<Y>" + (Math.round((object.rotation.x * THREE.Math.RAD2DEG) * 100) / 100) + "</Y>\n";
				output += "\t\t\t<Z>" + (Math.round((object.rotation.y * THREE.Math.RAD2DEG) * 100) / 100) + "</Z>\n";
				output += "\t\t</Rotation>\n";
				
				output += "\t</Antenna>\n";
			}
		}
		output += "</Antennas>";
		saveString(output, 'Antennas.xml');
	} );
	options.add( option );
	

	var opt1 = new UI.Row();
	opt1.setClass( 'option' );
	opt1.setTextContent( 'Export Object' );
	opt1.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected' );
			return;

		}

		var output = object.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'model.json' );

	} );
	options.add( opt1 );

	// Export

	var opt2 = new UI.Row();
	opt2.setClass( 'option' );
	opt2.setTextContent( 'Export Scene' );
	opt2.onClick( function () {

		var output = editor.scene.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'scene.json' );

	} );
	options.add( opt2 );

	//

	/*
	options.add( new UI.HorizontalRule() );

	// Export GLTF

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export GLTF' );
	option.onClick( function () {

		var exporter = new THREE.GLTFExporter();

		exporter.parse( editor.scene, function ( result ) {

			saveString( JSON.stringify( result, null, 2 ), 'scene.gltf' );

		} );


	} );
	options.add( option );

	// Export OBJ

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export OBJ' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		var exporter = new THREE.OBJExporter();

		saveString( exporter.parse( object ), 'model.obj' );

	} );
	options.add( option );

	// Export STL

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export STL' );
	option.onClick( function () {

		var exporter = new THREE.STLExporter();

		saveString( exporter.parse( editor.scene ), 'model.stl' );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Publish

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Publish' );
	option.onClick( function () {

		var zip = new JSZip();

		//

		var output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		var vr = output.project.vr;

		output = JSON.stringify( output, parseNumber, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		zip.file( 'app.json', output );

		//

		var manager = new THREE.LoadingManager( function () {

			save( zip.generate( { type: 'blob' } ), 'download.zip' );

		} );

		var loader = new THREE.FileLoader( manager );
		loader.load( 'js/libs/app/index.html', function ( content ) {

			var includes = [];

			if ( vr ) {

				includes.push( '<script src="js/WebVR.js"></script>' );

			}

			content = content.replace( '<!-- includes -->', includes.join( '\n\t\t' ) );

			zip.file( 'index.html', content );

		} );
		loader.load( 'js/libs/app.js', function ( content ) {

			zip.file( 'js/app.js', content );

		} );
		loader.load( '../build/three.min.js', function ( content ) {

			zip.file( 'js/three.min.js', content );

		} );

		if ( vr ) {

			loader.load( '../examples/js/vr/WebVR.js', function ( content ) {

				zip.file( 'js/WebVR.js', content );

			} );

		}

	} );
	options.add( option );

	/*
	// Publish (Dropbox)

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Publish (Dropbox)' );
	option.onClick( function () {

		var parameters = {
			files: [
				{ 'url': 'data:text/plain;base64,' + window.btoa( "Hello, World" ), 'filename': 'app/test.txt' }
			]
		};

		Dropbox.save( parameters );

	} );
	options.add( option );
	*/


	//

	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename || 'data.json';
		link.click();

		// URL.revokeObjectURL( url ); breaks Firefox...

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}

    options.newInput = function(){       // reset all input values and displays
        input_l.setValue(0);
        input_w.setValue(0);
        input_h.setValue(0);
        options.remove(input_pane);
        options.add(opt1);
        options.add(opt2);
    };

	return container;

};

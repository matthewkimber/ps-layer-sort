#target photoshop

/**
 * @copyright Copyright (c) 2020 Matthew Kimber. All rights reserved.
 * @author Matthew Kimber <matthew.kimber@gmail.com>
 * @version 1.1
 * @license Apache Software License 2.0
 */

(function(app) {
	if (isDocumentOpen()) {
		main();
	} else {
		alert("Please open a document to run this script.");
	}

	/**
	 * @desc Program entry point. Retrieves the active document, determines if layers exist, and then sorts all ArtLayer and LayerSet objects.
	 */
	function main() {
		var activeDoc = app.activeDocument;

		if (activeDoc.layers.length > 0) {
			sortLayers(activeDoc.layers);
		}
	}

	/**
	 * @desc Sorts the layers in the current LayerSet.
	 * @param {Layers} layers Collection of ArtLayer and LayerSet objects in the current scope.
	 */
	function sortLayers(layers) {
		var layerBuffer = new Array(),
			index = 0;
		
		for (index = 0; index < layers.length; index++) {
			if (!layers[index].isBackgroundLayer) {
				layerBuffer.push(layers[index]);
				
				// Check to see if we need to sort groups in the current layer set.
				if (typeof layers[index].layers !== "undefined" && layers[index].layers.length > 0) {
					sortLayers(layers[index].layers);
				}
			}
		}
		
		// Sort the buffer array using built-in natural sort comparer.
		layerBuffer.sort(compareWithNumbers);
		
		// Move each layer accordingly.
		for (index = 0; index < layerBuffer.length; index++) {
			layerBuffer[index].move(layers[index], ElementPlacement.PLACEBEFORE);
		}		
	}
	
	/**
	 * @desc Checks to see if there is a document open.
	 * @returns {Boolean}
	 */
	function isDocumentOpen() {
		return app.documents.length > 0;	
	}
}(app));
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
		
		// Sort the buffer array.
		layerBuffer.sort(alphanumericComparer);
		
		// Move each layer accordingly.
		for (index = 0; index < layerBuffer.length; index++) {
			layerBuffer[index].move(layers[index], ElementPlacement.PLACEBEFORE);
		}		
	}
	
	/**
	 * @desc Compares the left and right layer names in lower case form.
	 * @param {ArtLayer|LayerSet} lhs The left hand object.
	 * @param {ArtLayer|LayerSet} rhs The right hand object.
	 * @returns {Number} Will return a -1 if the left hand object is less than the right hand object. A 1 if the left hand object is greater than the right hand object. And 0 if they are equal.
	 */
	function alphanumericComparer(lhs, rhs) {
		l = lhs.name.toLowerCase();
		r = rhs.name.toLowerCase();
		
		if (l < r) {
			return -1;
		}
	
		if (l > r) {
			return 1;
		}
		
		return 0;
	}
	
	/**
	 * @desc Checks to see if there is a document open.
	 * @returns {Boolean}
	 */
	function isDocumentOpen() {
		return app.documents.length > 0;	
	}
}(app));
#target photoshop

/**
 * @copyright Copyright (c) 2020 Matthew Kimber. All rights reserved.
 * @author Matthew Kimber <matthew.kimber@gmail.com>
 * @version 1.2
 * @license Apache Software License 2.0
 */

(function(app) {
	if (isDocumentOpen()) {
		main();
	} else {
		alert("Please open a document to run this script.");
	}

	/**
	 * @desc Program entry point. Retrieves the active layer and sorts its children if it is a group/folder.
	 */
	function main() {
		var activeDoc = app.activeDocument;
		var activeLayer = activeDoc.activeLayer;

		if (activeLayer instanceof LayerSet) {
			if (activeLayer.layers.length > 0) {
				sortLayers(activeLayer.layers);
			}
		} else {
			alert("Please select a group/folder layer to sort its contents.");
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
			}
		}

		// Sort the buffer array using natural sort comparer.
		layerBuffer.sort(compareWithNumbers);

		// Move each layer accordingly.
		for (index = 0; index < layerBuffer.length; index++) {
			layerBuffer[index].move(layers[index], ElementPlacement.PLACEBEFORE);
		}
	}

	/**
	 * @desc Compares two layer objects by name using natural sort order (handles numbers correctly).
	 * @param {Layer} a First layer.
	 * @param {Layer} b Second layer.
	 * @returns {Number} Negative, zero, or positive number indicating sort order.
	 */
	function compareWithNumbers(a, b) {
		var aName = a.name.toLowerCase();
		var bName = b.name.toLowerCase();
		var aParts = aName.split(/(\d+)/);
		var bParts = bName.split(/(\d+)/);

		for (var i = 0; i < Math.min(aParts.length, bParts.length); i++) {
			if (aParts[i] !== bParts[i]) {
				if (!isNaN(aParts[i]) && !isNaN(bParts[i])) {
					return parseInt(aParts[i], 10) - parseInt(bParts[i], 10);
				}
				return aParts[i] < bParts[i] ? -1 : 1;
			}
		}
		return aParts.length - bParts.length;
	}

	/**
	 * @desc Checks to see if there is a document open.
	 * @returns {Boolean}
	 */
	function isDocumentOpen() {
		return app.documents.length > 0;
	}
}(app));

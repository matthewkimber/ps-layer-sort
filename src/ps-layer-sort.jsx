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
	 * @desc Program entry point. Retrieves the active document, shows the sort mode dialog,
	 *       and then sorts layers according to the chosen mode.
	 */
	function main() {
		var activeDoc = app.activeDocument;

		if (activeDoc.layers.length > 0) {
			var sortMode = showSortOptions();

			if (sortMode === 1) {
				sortLayers(activeDoc.layers);
			} else if (sortMode === 2) {
				sortGroupsOnly(activeDoc.layers);
			}
		}
	}

	/**
	 * @desc Displays a dialog allowing the user to choose between sorting all layers or groups only.
	 * @returns {Number} 1 for Sort All Layers, 2 for Sort Groups Only, 0 if cancelled.
	 */
	function showSortOptions() {
		var dialog = new Window("dialog", "Layer Sort Options");
		dialog.orientation = "column";
		dialog.alignChildren = "fill";
		dialog.margins = 16;
		dialog.spacing = 8;

		dialog.add("statictext", undefined, "Choose a sorting mode:");

		var btnSortAll = dialog.add("button", undefined, "Sort All Layers");
		var btnSortGroups = dialog.add("button", undefined, "Sort Groups Only");
		var btnCancel = dialog.add("button", undefined, "Cancel");

		var result = 0;

		btnSortAll.onClick = function() { result = 1; dialog.close(); };
		btnSortGroups.onClick = function() { result = 2; dialog.close(); };
		btnCancel.onClick = function() { result = 0; dialog.close(); };

		dialog.show();
		return result;
	}

	/**
	 * @desc Sorts the layers in the current LayerSet, including layers inside groups (recursive).
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
		
		// Sort the buffer array using natural sort comparer.
		layerBuffer.sort(compareWithNumbers);
		
		// Move each layer accordingly.
		for (index = 0; index < layerBuffer.length; index++) {
			layerBuffer[index].move(layers[index], ElementPlacement.PLACEBEFORE);
		}		
	}

	/**
	 * @desc Sorts only the group (LayerSet) layers at each level, leaving ArtLayer objects in their
	 *       current relative positions. Recurses into groups to also sort nested groups.
	 * @param {Layers} layers Collection of ArtLayer and LayerSet objects in the current scope.
	 */
	function sortGroupsOnly(layers) {
		var groupBuffer = new Array(),
			index = 0,
			i = 0,
			currentGroupCount = 0;

		for (index = 0; index < layers.length; index++) {
			if (!layers[index].isBackgroundLayer && typeof layers[index].layers !== "undefined") {
				groupBuffer.push(layers[index]);

				// Recurse into nested groups.
				if (layers[index].layers.length > 0) {
					sortGroupsOnly(layers[index].layers);
				}
			}
		}

		// Sort only the groups using natural sort comparer.
		groupBuffer.sort(compareWithNumbers);

		// Move each sorted group to its corresponding group-slot position.
		for (i = 0; i < groupBuffer.length; i++) {
			currentGroupCount = 0;
			for (index = 0; index < layers.length; index++) {
				if (!layers[index].isBackgroundLayer && typeof layers[index].layers !== "undefined") {
					if (currentGroupCount === i) {
						groupBuffer[i].move(layers[index], ElementPlacement.PLACEBEFORE);
						break;
					}
					currentGroupCount++;
				}
			}
		}
	}

	/**
	 * @desc Compares two layer objects using natural sort order (numbers compared numerically).
	 * @param {Layer} a First layer.
	 * @param {Layer} b Second layer.
	 * @returns {Number} Negative if a < b, positive if a > b, 0 if equal.
	 */
	function compareWithNumbers(a, b) {
		var nameA = a.name.toLowerCase();
		var nameB = b.name.toLowerCase();
		var partsA = nameA.match(/(\d+|\D+)/g) || [];
		var partsB = nameB.match(/(\d+|\D+)/g) || [];
		var len = Math.min(partsA.length, partsB.length);

		for (var i = 0; i < len; i++) {
			var numA = parseInt(partsA[i], 10);
			var numB = parseInt(partsB[i], 10);

			if (!isNaN(numA) && !isNaN(numB)) {
				if (numA !== numB) return numA - numB;
			} else {
				if (partsA[i] < partsB[i]) return -1;
				if (partsA[i] > partsB[i]) return 1;
			}
		}

		return partsA.length - partsB.length;
	}

	/**
	 * @desc Checks to see if there is a document open.
	 * @returns {Boolean}
	 */
	function isDocumentOpen() {
		return app.documents.length > 0;	
	}
}(app));
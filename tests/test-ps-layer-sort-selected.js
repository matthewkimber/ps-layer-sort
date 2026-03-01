/**
 * Tests for ps-layer-sort-selected.jsx
 *
 * Run with: node tests/test-ps-layer-sort-selected.js
 *
 * This test file mocks the Photoshop ExtendScript API and validates the core
 * sorting logic used in ps-layer-sort-selected.jsx.
 */

(function () {
	var passed = 0;
	var failed = 0;

	function assert(condition, message) {
		if (condition) {
			console.log("PASS: " + message);
			passed++;
		} else {
			console.log("FAIL: " + message);
			failed++;
		}
	}

	// ---------------------------------------------------------------------------
	// Minimal Photoshop API mocks
	// ---------------------------------------------------------------------------

	var ElementPlacement = { PLACEBEFORE: "PLACEBEFORE" };

	function MockLayer(name, isLayerSet, isBackground) {
		this.name = name;
		this.isBackgroundLayer = isBackground || false;
		if (isLayerSet) {
			this.layers = [];
		}
		this._movedBefore = null;
	}

	MockLayer.prototype.move = function (target, placement) {
		this._movedBefore = target;
	};

	// ---------------------------------------------------------------------------
	// Extracted functions under test (kept in sync with ps-layer-sort-selected.jsx)
	// ---------------------------------------------------------------------------

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
	 * Sorts layers in place and returns the sorted buffer for assertion purposes.
	 */
	function sortLayers(layers) {
		var layerBuffer = new Array();
		var index = 0;

		for (index = 0; index < layers.length; index++) {
			if (!layers[index].isBackgroundLayer) {
				layerBuffer.push(layers[index]);
			}
		}

		layerBuffer.sort(compareWithNumbers);

		for (index = 0; index < layerBuffer.length; index++) {
			layerBuffer[index].move(layers[index], ElementPlacement.PLACEBEFORE);
		}

		return layerBuffer;
	}

	// ---------------------------------------------------------------------------
	// Tests: compareWithNumbers
	// ---------------------------------------------------------------------------

	console.log("\n--- compareWithNumbers ---");

	assert(
		compareWithNumbers({ name: "Layer 2" }, { name: "Layer 10" }) < 0,
		"'Layer 2' sorts before 'Layer 10' (natural number sort)"
	);
	assert(
		compareWithNumbers({ name: "Layer 10" }, { name: "Layer 2" }) > 0,
		"'Layer 10' sorts after 'Layer 2' (natural number sort)"
	);
	assert(
		compareWithNumbers({ name: "Alpha" }, { name: "Beta" }) < 0,
		"'Alpha' sorts before 'Beta' (alphabetical)"
	);
	assert(
		compareWithNumbers({ name: "Beta" }, { name: "Alpha" }) > 0,
		"'Beta' sorts after 'Alpha' (alphabetical)"
	);
	assert(
		compareWithNumbers({ name: "layer a" }, { name: "Layer B" }) < 0,
		"Case-insensitive: 'layer a' sorts before 'Layer B'"
	);
	assert(
		compareWithNumbers({ name: "abc" }, { name: "abc" }) === 0,
		"Identical names compare as equal"
	);

	// ---------------------------------------------------------------------------
	// Tests: sortLayers – basic alphabetical order
	// ---------------------------------------------------------------------------

	console.log("\n--- sortLayers: alphabetical ---");

	var layers = [
		new MockLayer("Charlie"),
		new MockLayer("Alpha"),
		new MockLayer("Beta"),
	];
	var sorted = sortLayers(layers);
	assert(sorted[0].name === "Alpha", "First layer is 'Alpha'");
	assert(sorted[1].name === "Beta", "Second layer is 'Beta'");
	assert(sorted[2].name === "Charlie", "Third layer is 'Charlie'");

	// ---------------------------------------------------------------------------
	// Tests: sortLayers – natural number sort
	// ---------------------------------------------------------------------------

	console.log("\n--- sortLayers: natural number sort ---");

	var numberedLayers = [
		new MockLayer("Layer 10"),
		new MockLayer("Layer 2"),
		new MockLayer("Layer 1"),
	];
	var sortedNumbered = sortLayers(numberedLayers);
	assert(sortedNumbered[0].name === "Layer 1", "'Layer 1' is first");
	assert(sortedNumbered[1].name === "Layer 2", "'Layer 2' is second");
	assert(sortedNumbered[2].name === "Layer 10", "'Layer 10' is third (natural sort)");

	// ---------------------------------------------------------------------------
	// Tests: sortLayers – background layers are excluded
	// ---------------------------------------------------------------------------

	console.log("\n--- sortLayers: background layer exclusion ---");

	var layersWithBg = [
		new MockLayer("Charlie"),
		new MockLayer("Background", false, true),
		new MockLayer("Alpha"),
	];
	var sortedWithBg = sortLayers(layersWithBg);
	assert(sortedWithBg.length === 2, "Background layer is excluded from the sort buffer");
	assert(sortedWithBg[0].name === "Alpha", "'Alpha' is first after excluding background");
	assert(sortedWithBg[1].name === "Charlie", "'Charlie' is second after excluding background");

	// ---------------------------------------------------------------------------
	// Tests: sortLayers – already sorted list is unchanged
	// ---------------------------------------------------------------------------

	console.log("\n--- sortLayers: already sorted ---");

	var alreadySorted = [
		new MockLayer("Alpha"),
		new MockLayer("Beta"),
		new MockLayer("Charlie"),
	];
	var sortedAlready = sortLayers(alreadySorted);
	assert(sortedAlready[0].name === "Alpha", "Order preserved: 'Alpha' first");
	assert(sortedAlready[1].name === "Beta", "Order preserved: 'Beta' second");
	assert(sortedAlready[2].name === "Charlie", "Order preserved: 'Charlie' third");

	// ---------------------------------------------------------------------------
	// Tests: sortLayers – single layer
	// ---------------------------------------------------------------------------

	console.log("\n--- sortLayers: single layer ---");

	var singleLayer = [new MockLayer("Solo")];
	var sortedSingle = sortLayers(singleLayer);
	assert(sortedSingle.length === 1, "Single layer returned");
	assert(sortedSingle[0].name === "Solo", "Single layer name unchanged");

	// ---------------------------------------------------------------------------
	// Tests: sortLayers – group layers are included (but not recursed)
	// ---------------------------------------------------------------------------

	console.log("\n--- sortLayers: group layers included ---");

	var groupLayer = new MockLayer("Group B", true);
	groupLayer.layers = [new MockLayer("Inner Z"), new MockLayer("Inner A")];

	var mixedLayers = [groupLayer, new MockLayer("Art A"), new MockLayer("Art Z")];
	var sortedMixed = sortLayers(mixedLayers);
	assert(sortedMixed[0].name === "Art A", "'Art A' sorts before 'Group B'");
	assert(sortedMixed[1].name === "Art Z", "'Art Z' sorts before 'Group B'");
	assert(sortedMixed[2].name === "Group B", "'Group B' is last");
	// Inner layers of the group are NOT sorted by this function (selected-only behaviour)
	assert(groupLayer.layers[0].name === "Inner Z", "Inner layers of group are not touched");

	// ---------------------------------------------------------------------------
	// Summary
	// ---------------------------------------------------------------------------

	console.log("\n--- Results ---");
	console.log("Passed: " + passed);
	console.log("Failed: " + failed);

	if (failed > 0) {
		process.exit(1);
	}
})();

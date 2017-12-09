/* TODO: 
Add score counter, 
add game over logic, 
fix bug with new tile location, 
add logic so that new tile is rendered after move animation, 
randomise value of new tile,
check if move is valid (i.e. if any movement took place),
algorithm for colouring tiles
*/
(function(){
	
	var tileDivs = [];
	var board = $("#board")[0];
	var tileObjects = [];
	var nextTileId = 0;
	
	// CN Creates new instance of a tile with the specified location and value
	function Tile(value, col, row){
		this.value = value;
		this.col = col;
		this.row = row;
		// CN Sets unique id of this tile
		this.id = ('t_' + nextTileId);
		nextTileId += 1;
		
		$(board).append("<div class='tile' id='" + this.id + "'></div>");
		tileObjects.push(this);
		
		this.placeTile = function(){
			var tileDiv = $("#" + this.id)[0];
			// CN position of tile controlled with CSS attributes 
			tileDiv.style.top = ((this.row * 25) + '%');
			tileDiv.style.left = ((this.col * 25) + '%');
			tileDiv.innerHTML = ("<span>" + this.value + "</span>");
		}
		
		this.moveTile = function(axis){
			var tileDiv = $("#" + this.id)[0];
			var targetLocation;
			if(axis == 'top'){
				targetLocation = ((this.row * 25) + '%');
			}
			if(axis == 'left'){
				targetLocation = ((this.col * 25) + '%');
			}
			$(tileDiv).animate({[axis]: targetLocation}, 200);
		}
		
		this.removeTile = function(){
			//array.splice
			for(var i=0; i<tileObjects.length; i++){
				if(tileObjects[i].id == this.id){
					tileObjects.splice(i, 1);
					break;
				}
			}
			// CN delete div 
			var tileDiv = $("#" + this.id)[0];
			$(tileDiv).remove();
		}
		
		this.getCoordinates = function(){
			return [this.col, this. row];
		}
		
		this.setRow = function(row){
			this.row = row;
		}
		
		this.getRow = function(){
			return this.row;
		}
		
		this.setCol = function(col){
			this.col = col;
		}
		
		this.getCol = function(){
			return this.col;
		}
		
		this.placeTile();
	}
	
	
	function getTiles(){
		tileDivs = $('.tile');
	};
	
	function calculateDestination(event){
		// CN Tiles moving up/down: run through each column, sort tiles in column in order of row, then assign new row in correct order
		if(event.key == 'ArrowUp' || event.key == 'ArrowDown'){
			for(var x=0; x<4; x++){
				var tilesInCol = [];
				for(var i =0; i<tileObjects.length; i++){
					if(tileObjects[i].col == x){
						tilesInCol.push(tileObjects[i]);
					}
				}
				tilesInCol.sort(function(a,b){
					return a.row - b.row;
				})
				// CN After sorting tiles, check for matches and execute any needed combinations before assigning new row
				tilesInCol = checkMatches(tilesInCol);
				if(event.key == 'ArrowUp'){
					for(var i =0; i<tilesInCol.length; i++){
						tilesInCol[i].setRow(i);
					}
				}
				if(event.key == 'ArrowDown'){
					var transform = 4 - tilesInCol.length;
					var newRow;
					for(var i =0; i<tilesInCol.length; i++){
						tilesInCol[i].setRow(i);
						newRow = tilesInCol[i].getRow()+transform;
						tilesInCol[i].setRow(newRow);
					}
				}
			}
		}
		// CN Tiles moving left/right: run through each row, sort tiles in row in order of column, then assign new column in correct order
		if(event.key == 'ArrowLeft' || event.key == 'ArrowRight'){
			for(var x=0; x<4; x++){
				var tilesInRow = [];
				for(var i =0; i<tileObjects.length; i++){
					if(tileObjects[i].row == x){
						tilesInRow.push(tileObjects[i]);
					}
				}
				tilesInRow.sort(function(a,b){
					return a.col - b.col;
				})
				// CN After sorting tiles, check for matches and execute any needed combinations before assigning new row
				tilesInRow = checkMatches(tilesInRow);
				if(event.key == 'ArrowLeft'){
					for(var i =0; i<tilesInRow.length; i++){
						tilesInRow[i].setCol(i);
					}
				}
				if(event.key == 'ArrowRight'){
					var transform = 4 - tilesInRow.length;
					var newCol;
					for(var i =0; i<tilesInRow.length; i++){
						tilesInRow[i].setCol(i);
						newCol = tilesInRow[i].getCol()+transform;
						tilesInRow[i].setCol(newCol);
					}
				}
			}
		}
	}
	
	function moveTiles(event){
		calculateDestination(event);
		for(var i =0; i<tileObjects.length; i++){
			if(event.key == 'ArrowUp' || event.key == 'ArrowDown'){
				tileObjects[i].moveTile('top');
			}
			if(event.key == 'ArrowLeft' || event.key == 'ArrowRight'){
				tileObjects[i].moveTile('left');
			}
		}
		generateNewTile();
	}
	
	// CN Iterate through given list of tiles and check for value matches. Combines each matched pair into a new tile and returns updated list of tiles
	function checkMatches(tileList){
		if(tileList.length > 1){
			var updatedList = [];
			for (var i=0; i < (tileList.length-1); i++){
				if(tileList[i].value == tileList[i+1].value){
					var newTile = combineTiles(tileList[i], tileList[i+1]);
					updatedList.push(newTile);
				} else if(i==tileList.length-2){
					// CN Last iteration, add both tiles
					updatedList.push(tileList[i])
					updatedList.push(tileList[i+1]);
				} else{
					updatedList.push(tileList[i]);
				}
			}
			return updatedList;
		} else {
			// CN Only one tile in list, return original tile
			return tileList;
		}
	}
	
	// CN  Generate new tile in random valid location 
	function generateNewTile(){
		var openLocations = checkOpenLocations();
		if(openLocations.length > 0){
			// CN get random location string and format into valid coordinates
			var randomIndex = Math.floor(Math.random() * openLocations.length);
			var newCol = parseInt(openLocations[randomIndex].split('(')[1]);
			var newRow = parseInt(openLocations[randomIndex].split(',')[1]);
			new Tile(2, newCol, newRow);
		}
	}
	
	// CN Check for open positions on the board
	function checkOpenLocations(){
		// CN Create array of every possible location
		var allLocations = [];
		for(var c = 0; c<4;c++){
			for(var r = 0; r<4;r++){
				var coords = '(' + c + ',' + r + ')';
				allLocations.push(coords);
			}
		}
		// CN Iterate through tile objects and remove their location from list, leaving only open locations
		var thisTileCoordinates;
		for(var i = 0; i<tileObjects.length; i++){
			thisTileCoordinates = '(' + tileObjects[i].getCol() + ',' + tileObjects[i].getRow() + ')';
			var thisTileIndex = allLocations.indexOf(thisTileCoordinates);
			allLocations.splice(thisTileIndex, 1) ;
		}
		return allLocations;
	}
	
	// CN Combine two given tiles into new tile, return reference to new tile
	function combineTiles(tileA, tileB){
		var newTile = new Tile((tileA.value*2), tileA.col, tileA.row);
		tileA.removeTile();
		tileB.removeTile();
		return newTile;
	}
	
	
	
	
	new Tile(2, 1, 1);
	new Tile(2, 0, 0);
	new Tile(4, 1, 0);
	document.addEventListener("keydown", moveTiles);
	getTiles();
	
}($));
const boardSize = 5;
const boardSquare = boardSize * boardSize;

class Co{
	// cordinate
  constructor(x, y){
    //takes intergers
    this.x = x;  //REQUIRED. horizontal postion
    this.y = y;  //REQUIRED. vertical postion
    this.id = "" + x + "-" + y; //string id
  }

  get x () { return this._x }
  get y () { return this._y }

  set x (newX) {
    //takes interger
    this._x = newX;
    this.id = "" + this._x + "-" + this._y;
  }

  set y (newY) {

    //takes interger
    this._y = newY;
    this.id = "" + this._x + "-" + this._y;
  }

  same(otherCo){
    //takes Co
    return this.x === otherCo.x && this.y === otherCo.y ? true : false;
  } //tested

  direction(otherCo){
    //takes Co
    let result = null
    if (this.x === otherCo.x) {
      result = this.y < otherCo.y ? 1: 3;
    }else{
      result = this.x < otherCo.x ? 2: 0;
    }
    return result;

  } //tested

  adjacent(direc){
    const adjacentResult = this.copy()
    if(direc == 0) {adjacentResult.x -= 1;}
    if(direc == 1) {adjacentResult.y += 1;}
    if(direc == 2) {adjacentResult.x += 1;}
    if(direc == 3) {adjacentResult.y -= 1;}

    return adjacentResult;
  } //tested

  toWall(direct){
    return [this.x, this.y, this.adjacent(direct).x, this.adjacent(direct).y]

  } //tested

  copy(){
    return new Co(this.x, this.y);
  }
} // tested

class Tile{
	//information stored on a tile.
	constructor (hash) {
    this.x = hash.x;  //REQUIRED. horizontal postion interger
    this.y = hash.y;  //REQUIRED. vertical postion interger
    this.id = "" + this.x + "-" + this.y; //string id
    this.co = new Co(this.x, this.y); //is the cordinate
    this.walls = hash.setupWalls || [false, false, false, false];//true means wall exists for north,east,south, west.
    this.occupide = hash.occupide || false; //occupied for god
    this.clutterd = hash.clutterd || false; //is cluterd
    this.eatMe = true //stores eatme's
	}

	copy(){
	  const temp = new Tile({x:this.x, y:this.y, ocupide:this.ocupide, clutterd:this.clutterd});
	 	for (let i=0; i<4; i++ ){
	  	temp.walls[i] = this.walls[i];
	 	}
    temp.eatMe = this.eatMe
	 	return temp;
	}
} // tested complete v1

class Board{
  // game boards and
  constructor (){
    this.tiles = [];
    this.walls =[]; //dosent count outer edge
    this.quadrents = this.makeQuadrents();
    this.quadCount = [0,0,0,0,0]
    this.goals = []
    this.pack = this.randomFromQuadrent(0)
    this.eaten = 0
    this.movesTaken = 0;
  } //tested

  copy(){
    let newBoard = new Board();
    this.tiles.forEach(tile => newBoard.tiles.push(tile.copy()));
    this.walls.forEach(wall => newBoard.walls.push(wall.copy()));
    newBoard.quadCount = [];
    this.quadCount.forEach(count => newBoard.quadCount.push(count));
    this.goals.forEach(goal => newBoard.goals.push(goal.copy()));
    newBoard.pack = this.pack.copy();
    newBoard.eaten = this.eaten;
    newBoard.movesTaken = this.movesTaken;
    return newBoard;
  } //tested

  addTile(x, y){
    // takes intergers
    this.tiles.push(new Tile({x:x, y:y}));
  } //tested

  findI(x, y){
    // takes intergers
    return this.findCo(new Co(x, y));
  } //tested

  findCo(co){
    // takes CO
    const coId = co.id;
    let found = null;
    this.tiles.forEach((tile) => {
      found = tile.id === coId ? tile : found;
    })
    return found;
  } //tested

  findWallId(wallId){
    let found = null;
    this.walls.forEach((wall) => {
      found = wall.id === wallId ? wall : found;
    })
    return found;
  } //untested

  addWall(wallTiles) {
    // takes an array with 4 intergers [x1, y1, x2, y2]
    if(wallTiles[0] === wallTiles[2]) {
      this.findI(wallTiles[0],wallTiles[1]).walls[1] = true;
      this.findI(wallTiles[2],wallTiles[3]).walls[3] = true;
    } else {
      this.findI(wallTiles[0],wallTiles[1]).walls[2] = true;
      this.findI(wallTiles[2],wallTiles[3]).walls[0] = true;
    }
    this.walls.push( new Wall(wallTiles))
  } //tested

  removeWall(wallTiles) {
    // takes an array with 4 intergers [x1, y1, x2, y2]
    if(wallTiles[0] == wallTiles[2]) {
      this.findI(wallTiles[0],wallTiles[1]).walls[1] = false;
      this.findI(wallTiles[2],wallTiles[3]).walls[3] = false;
    } else {
      this.findI(wallTiles[0],wallTiles[1]).walls[2] = false;
      this.findI(wallTiles[2],wallTiles[3]).walls[0] = false;
    }
    let tempId = "" + wallTiles[0] + "-" + wallTiles[1]+ "-" + wallTiles[2]+ "-" + wallTiles[3];
    let toRemove =[];
    this.walls.forEach((wall, ind )=>{if(wall.id === tempId) {toRemove.push(ind)}})
    toRemove.forEach((index)=>{this.walls.splice(index, 1);})
  } //tested

  randomWall() {
  // find large random
  let r1= Math.floor(Math.random() * (boardSize));
  // find small random
  let r2= Math.floor(Math.random() * (boardSize-1));
  // test horizontal or vetical
    if( Math.floor(Math.random() * 2) == 0){
      return [r1, r2, r1, (r2 +1)];
    }else{
      return [r2, r1, (r2+1), r1];
    }
  } //tested

  setUp() {
    for (let l=0; l<boardSize; l++){
      for (let w=0; w<boardSize; w++){
        this.addTile(l, w);
        const newTile = this.findI(l, w);
        newTile.walls[0] = (l==0);
        newTile.walls[1] = (w==boardSize-1);
        newTile.walls[2] = (l==boardSize-1);
        newTile.walls[3] = (w==0);
      }
    }
    this.makeGoal()
    this.makeGoal()
    // randomiseWalls(10);  //for size3 walls4 is max, max = size-1 squared
  } //tested

  splitBoard(){
    // cerate list of tiles
    let list = new Path();
    list.fullBoard();
    list.remove(0);
    const startingPath = new Path();
    startingPath.addCo(new Co(0, 0));
    let paths= [startingPath];
    // while array has index
    while(paths[0] != null && list.tiles[0] != null){
      let rootCo = paths[0].root();
      let rootTile = this.findCo(rootCo);
      let virtualId = null;
      for (let c=0;c<4;c++){
        if (rootTile.walls[c]){
          let save = false;
        }else{
          switch(c){
            case 0:
              virtualId = new Co(rootCo.x-1, rootCo.y);
            break;
            case 1:
              virtualId = new Co(rootCo.x, rootCo.y+1);
            break;
            case 2:
              virtualId = new Co(rootCo.x+1, rootCo.y);
            break;
            case 3:
              virtualId = new Co(rootCo.x, rootCo.y-1);
            break;
          }
          let save = this.findCo(virtualId).occupide == false;
          let listIndex = list.findCo(virtualId);
          if(save && listIndex !== null) {
            list.remove(listIndex);
            let pathNew = paths[0].copy();
            pathNew.addCo(virtualId)
            paths.push(pathNew)
          }
        }
      }
      paths.shift();
      //console.log(paths);
      //console.log(list);

    }
    if(list.tiles[0] === undefined){
      //console.log(list.tiles[0]);
      return false
    }else{
      //console.log(list.tiles[0]);
      return true
    }
  } // tested but long

  randomiseWalls(numberOfWalls){
    // takes interger
    let virtualBoard = this.copy();
    let wallsToAdd = numberOfWalls;
    let curentWalls = [];
    while(wallsToAdd > 0) {
      let virtualWall = this.randomWall();
      if(this.searchArray(curentWalls, virtualWall) === null){
        virtualBoard.addWall(virtualWall);
        if(virtualBoard.splitBoard()) {

          virtualBoard = this.copy();
          curentWalls.push(virtualWall);
        }else{
          this.become(virtualBoard);
          wallsToAdd --;
          curentWalls.push(virtualWall);
        }
      }
    }
  } // tested

  shortestPath(startPoint, endPoint){
    // takes Co's
    // cerate list of tiles
    let list = new Path();
    list.fullBoard();
    let lenthList = new Path();
    lenthList.maxLenths();
    let startPath = new Path();
    startPath.addCo(startPoint);
    let posiblePaths= [startPath];
    lenthList.testLegnths(list,posiblePaths[0]);
    let finishedPaths = [];
    //while array has index
    while(posiblePaths[0] != undefined){
      // check if it can still be shortes
      if (finishedPaths[0] != undefined && posiblePaths[0].traveled < finishedPaths[0].traveled || finishedPaths[0] === undefined ) {
        let rootCo = posiblePaths[0].root();
        let rootTile = this.findCo(rootCo);
        for (let c = 0; c < 4; c++){
          let save = false;
          let virtualCo = rootCo.copy();
          let virtualPath = posiblePaths[0].copy();
          if (rootTile.walls[c] === false){
            switch(c){
              case 0:
                virtualCo.x -= 1;
              break;
              case 1:
                virtualCo.y += 1;
              break;
              case 2:
                virtualCo.x += 1;
              break;
              case 3:
                virtualCo.y -= 1;
                break;
            }
            save = (this.findCo(virtualCo).occupide === false);
            if(this.findCo(virtualCo).clutterd){
              virtualPath.traveled += 2;
            }else{
              virtualPath.traveled += 1;
            }
            virtualPath.tiles.push(virtualCo);
            //test finish
            if(save && lenthList.testLegnths(list,virtualPath)){
              if(virtualCo.same(endPoint)){
                if (finishedPaths[0] != undefined && virtualPath.traveled < finishedPaths[0].traveled ) {
                  finishedPaths = [];
                }
                finishedPaths.push(virtualPath);
              }else{
                posiblePaths.push(virtualPath);
              }
            }
          }
        }
      }
      posiblePaths.shift();
    }
      return finishedPaths;
  }  // tested but long

  findQuadrent(qCo){
    let qResult = null;
    for(q=0; q<5; q++){
      if(this.quadrents[q].findCo(qCo) !== null){
        qResult = q;
      }
    }
    return qResult;
  }

  randomFromQuadrent(quad) {
    let quadrent = this.quadrents[quad];
    return quadrent.tiles[Math.floor(Math.random()*quadrent.tiles.length)];
  }

  makeGoal(){
    let quad = null;
    let quads = [];
    let delIndex = null;
    switch(this.goals.length){
      case 0:
        quad = (Math.floor(Math.random()*4) +1)
        this.goals.push( new Goal(this.randomFromQuadrent(quad),quad, "cherry"))
        this.quadCount[quad] +=1;
        break;
      case 1:
        quads = [1,2,3,4]
        delIndex = quads.findIndex(x => x== this.goals[0].quadrent);
        quads.splice(delIndex, 1);
        quad = quads[Math.floor(Math.random()*3)]
        this.goals.push( new Goal(this.randomFromQuadrent(quad),quad,"pear"))
        this.quadCount[quad] +=1;
        break;
      case 2:
        quads = [1,2,3,4]
        delIndex = quads.findIndex(x => x== this.goals[0].quadrent);
        quads.splice(delIndex, 1);
        delIndex = quads.findIndex(x => x== this.goals[1].quadrent);
        quads.splice(delIndex, 1);
        let name = "cherry"
        name = this.goals[1].name === "cherry" ? "pear":name;
        name = this.goals[1].name === "pear" ? "grapes":name;

        if (this.quadCount[quads[0]] === this.quadCount[quads[1]]) {
          quad = quads[Math.floor(Math.random()*2)]
        }else if(this.quadCount[quads[0]] < this.quadCount[quads[1]]) {
          quads.push(quads[0])
          quad = quads[Math.floor(Math.random()*3)]
        }else{
          quads.push(quads[1])
          quad = quads[Math.floor(Math.random()*3)]
        }
      this.goals.push( new Goal(this.randomFromQuadrent(quad),quad, name))
        this.quadCount[quad] +=1;
        break;
    }
  }

  movePack(postion){
    const newPostion = this.findCo(postion);
    if (newPostion.eatMe){
      newPostion.eatMe = false;
      master.view.removeId(`EatMe${newPostion.id}`);
      this.eaten += 1;
      master.view.updateControler(this);
    }
    this.pack = postion.copy()
    master.view.drawPack(this);
  }


  // internal functions

  searchArray(curentWalls, virtualWall) {
    // for randomiseWalls not to be called itself.
    // curentWalls is an array of wall arrays [x1,y1,x2,y2]. virtualWall is a singel wall array
    let result = null;
    curentWalls.forEach((wallsSet, index) =>{
      if (wallsSet.length === virtualWall.length) {
        let allMatching = true;
        wallsSet.forEach((wall, ind ) => {
          allMatching = wall === virtualWall[ind] ? allMatching : false;
        })
        if (allMatching === true) {result = index;}
      }
    })
    return result;
  } //tested

  become(board){
    //for randomiseWalls not to be called itself
    // takes a Board
    this.tiles = [];
    board.tiles.forEach(tile => this.tiles.push(tile.copy()));
    this.walls = [];
    board.walls.forEach(wall => this.walls.push(wall.copy()));
    this.quadCount = [];
    board.quadCount.forEach(count => this.quadCount.push(count));
    this.goals = []
    board.goals.forEach(goal => this.goals.push(goal.copy()));
    this.pack = board.pack.copy();
    this.eaten = board.eaten;
    this.movesTaken = board.movesTaken;
  }

  wallMoveHilight(wallId){
    let result = [];
    let rootWall = this.findWallId(wallId);
    result.push([rootWall,"root"]);
    if(rootWall.vertical){
      let start = rootWall.startCo.copy();
      this.wallMoveHilightPush(start, 2, result)
      start.x += 1;
      this.wallMoveHilightPush(start, 1, result)
      start.y += 1;
      start.x -= 1;
      this.wallMoveHilightPush(start, 2, result)
      start.x -= 1;
      this.wallMoveHilightPush(start, 2, result)
      start.y -= 1;
      this.wallMoveHilightPush(start, 1, result)
      this.wallMoveHilightPush(start, 2, result)
      return result;

    }else{
      let start = rootWall.startCo.copy();
      this.wallMoveHilightPush(start, 1, result)
      start.y -= 1;
      this.wallMoveHilightPush(start, 1, result)
      this.wallMoveHilightPush(start, 2, result)
      start.x += 1;
      this.wallMoveHilightPush(start, 1, result)
      start.y += 1;
      this.wallMoveHilightPush(start, 1, result)
      start.y += 1;
      start.x -= 1;
      this.wallMoveHilightPush(start, 2, result)
      return result;
    }
  } //tested

  wallMoveHilightPush(startCo, dir, moveArray){
    let tempWall = new Wall(startCo.toWall(dir));
    let status=""
    if(this.findCo(startCo) === null){
      status = "offBoard"
    }else{
      status = this.findCo(startCo).walls[dir] ? "exists" : "available";

      status = tempWall.onBoard() ?  status : "offBoard";
    }
    moveArray.push([tempWall, status])
  } //tested

  makeQuadrents(){
    let result = [new Path(), new Path(), new Path(), new Path(), new Path()]
    let b1=0; //boarders
    let b2=0;
    let sortable = new Path;
    sortable.fullBoard();

    if((boardSize % 2) === 0){
    //even
      b1 = ((boardSize/2)-1);
      b2 = b1+2;
    }else{
      b1 = Math.floor((boardSize/2.0)-0.5);
      b2 = b1+1;
    }

    sortable.tiles.forEach((tileCo)=>{
      if(tileCo.x < b1) {
        if(tileCo.y < b1) {
          result[1].tiles.push(tileCo);
        }else{
          result[2].tiles.push(tileCo);
        }
      }else if(tileCo.x < b2){
        if(tileCo.y < b1) {
          result[1].tiles.push(tileCo);
        }else if(tileCo.y < b2) {
          result[0].tiles.push(tileCo);
        }else{
          result[3].tiles.push(tileCo);
        }
      }else{
        if(tileCo.y < b2) {
          result[4].tiles.push(tileCo);
        }else{
          result[3].tiles.push(tileCo);
        }
      }
    })
    return result;
  }

} // tested

class Path{
  constructor() {
    this.traveled=0; //distance traveled
    this.tiles=[]; //cordinate list
  } //tested

  addCo(co) {
    // takes a Co
    this.tiles.push(co)
  } //tested

  copy() {
    let newp = new Path();
    this.tiles.forEach(co => newp.addCo(co.copy()));
    newp.traveled = this.traveled;
    return newp;
  } //tested

  findI(x, y){
    // takes intergers
    return this.findCo(new Co(x, y));
  } //tested

  findCo(co1) {
    // takes Co
    let found = null;
    this.tiles.forEach((co2, index) => {found = co1.same(co2) ? index : found;})
    return found;
  } //tested

  remove(index) {
    // takes interger
    this.tiles.splice(index, 1);
  } //tested

  fullBoard() {
    for (let l=0; l<boardSize; l++){
      for (let w=0; w<boardSize; w++){
       this.addCo(new Co(l, w));
      }
    }
  } //tested

  root() {
    // just for board.splitBoard()
    return this.tiles[(this.tiles.length -1)];
  } //tested

  maxLenths() {
    for (let i=0; i<boardSquare; i++){
      this.tiles.push(boardSquare);
    }
  } // tested

   // internal functions

  testLegnths(list, path) {
    //for Board.shortestPath not to be called itself
    // list is a Path holding a lookup table of the games tiles. path is a Path
    let index = list.findCo(path.root());
    let result = true;
    if(this.tiles[index] >= path.traveled){
        this.tiles[index] = path.traveled;
    }else{
      result = false;
    }
    return result;
  } // tested

} // tested complete v1

class ViewTerminal{

  drawWallsThick(board){
    let verEdge = " --- ";
    let verWall = " xxx " ;
    let eastEdge = " |" ;
    let eastWall = " x" ;
    let westEdge = "|  ";
    let westWall = "x  " ;
    let draw = []
    for (let l=0; l<boardSize; l++){
      draw.push(["","","","",""])
      for (let w=0; w<boardSize; w++){
        board.findI(l,w).walls[0] ? draw[l][0] += verWall : draw[l][0] += verEdge
        board.findI(l,w).walls[2] ? draw[l][4] += verWall : draw[l][4] += verEdge
        board.findI(l,w).walls[3] ? draw[l] = this.drawThree(draw[l], westWall): draw[l] = this.drawThree(draw[l], westEdge)
        board.findI(l,w).walls[1] ? draw[l] = this.drawThree(draw[l], eastWall): draw[l] = this.drawThree(draw[l], eastEdge)
      }
    }
    draw.forEach(row => row.forEach(line => console.log(line)));
  } //tested

  drawWallsThin(board){
    let verEdge = "--- ";
    let verWall = "xxx " ;
    let eastEdge = "   |" ;
    let eastWall = "   x" ;
    let draw = []
    for (let l=0; l<boardSize; l++){
      draw.push([" ","x","x","x"])
      for (let w=0; w<boardSize; w++){
        board.findI(l, w).walls[0] ? draw[l][0] += verWall : draw[l][0] += verEdge
        board.findI(l, w).walls[1] ? draw[l] = this.drawThree(draw[l], eastWall) : draw[l] = this.drawThree(draw[l], eastEdge)
      }
    }
    draw.push([" "])
    for (let w=0; w<boardSize; w++){
      draw[boardSize][0] += verWall;
    }
    draw.forEach(row => row.forEach(line => console.log(line)));
  } // tested

  drawPath(board, path){
    let verEdge = "--- ";
    let verWall = "xxx " ;
    let eastEdge = "|" ;
    let eastWall = "x" ;
    let blank = " ";
    let vPath = ":";
    let hPath = "~";
    let draw = []
    for (let l=0; l<boardSize; l++){
      draw.push([" ","x","x","x"])
      for (let w=0; w<boardSize; w++){
        board.findI(l, w).walls[0] ? draw[l][0] += verWall : draw[l][0] += verEdge
        let pathId= path.findI(l,w);
        let north = blank;
        let south = blank;
        let east = blank;
        let west = blank;
        let nextStep = null;
        let lastStep = null;

        switch(pathId){
          case null:
          break;
          case 0:
            nextStep = path.tiles[1]
          break;
          case (path.tiles.length - 1):
             lastStep = path.tiles[pathId - 1]
          break;
          default:
            nextStep = path.tiles[pathId + 1]
            lastStep = path.tiles[pathId - 1]
        }

        if(nextStep != null){
          // console.log( "next");
          // console.log(nextStep);

          if(l == nextStep.x){
            if(w > nextStep.y){
              west = hPath;
              //console.log( "nw");
            }else{
              east = hPath;
              //console.log( "ne");
            }
          }else{
            if(l < nextStep.x){
              south = vPath;
            }else{
              north = vPath;
            }
          }
        }

        if(lastStep != null){
          // console.log( "last");
          // console.log(lastStep);
          if(l == lastStep.x){
            if(w > lastStep.y){
              west = hPath;
              //console.log( "lw");
            }else{
              east = hPath;
              //console.log( "le");
            }
          }else{
            if(l < lastStep.x){
              south = vPath;
            }else{
              north = vPath;
            }
          }
        }
        this.drawEach(draw[l],blank,west,blank);
        this.drawEach(draw[l],north, blank, south);
        this.drawEach(draw[l],blank,east,blank);

        board.findI(l, w).walls[1] ? draw[l]=this.drawThree(draw[l], eastWall): draw[l]=this.drawThree(draw[l], eastEdge)
      }
    }
    draw.push([" "])
    for (let w=0; w<boardSize; w++){
      draw[boardSize][0] += verWall;
    }
    draw.forEach(row => row.forEach(line => console.log(line)));
  } //tested

  // internal use

  drawThree(array, string){
    array[1] += string;
    array[2] += string;
    array[3] += string;
    return array
  } //tested

  drawEach(array, stringA, stringB, stringC){
    array[1] += stringA;
    array[2] += stringB;
    array[3] += stringC;
    return array
  } //tested
} //tested complete v1

class Wall {
  constructor(wallArray) {
    // takes array
    this.array = wallArray;
    this.vertical = this.array[0] === this.array[2] ? true : false;
    this.startCo = new Co(this.array[0], this.array[1]);
    this.endCo =  new Co(this.array[2], this.array[3]);
    this.id = "" + this.array[0] + "-" + this.array[1]+ "-" + this.array[2]+ "-" + this.array[3]; //string id
  } // Tested

  copy() {return new Wall(this.array)} // Tested

  onBoard(){
    let result = this.array[0] < 0 || (this.array[0] > (boardSize -2) && this.vertical !== true ) || (this.array[0] > (boardSize -1) && this.vertical == true ) ? false : true;
    result = this.array[1] < 0 || (this.array[1] > (boardSize -1) && this.vertical !== true) || (this.array[1] > (boardSize -2) && this.vertical == true) ? false : result;
    return result;

  }//tested

} // Tested

class Goal{

  constructor(co, quad, name){
    this.co = co;
    this.quadrent = quad
    this.name = name  // cherry 》 pear 》 grapes
  }

  copy() {
    return new Goal(this.co.copy(), this.quad, this.name)
  }
}

class ViewHtml {

  constructor(){
    this.boardPlayable = document.querySelector("#boardPlayable");
    this.style = document.querySelector("style");
    this.controler = document.querySelector("#mainControler");
    this.tileSize = 0;

  } // tested

  setUp(board){
    //set tile size needs to be added here.
    this.setCssSizes();
    this.drawTiles(board);
    this.drawWalls(board);
    this.drawControler()
    this.updateControler(board)
    this.updateGoals(board)
    this.drawPack(board)
  }

  drawTiles(board){
    //draw tiles
    board.tiles.forEach((tile)=>{
      // const print=document.querySelector("#${tile.id}")
      this.boardPlayable.insertAdjacentHTML("beforeend", this.addTile(tile.co));
      this.boardPlayable.insertAdjacentHTML("beforeend", this.addEatMe(tile.co));
    })
  }// tested

  drawWalls(board){
    board.walls.forEach((wall)=>{
      // const print=document.querySelector("#${tile.id}")
      this.boardPlayable.insertAdjacentHTML("beforeend", this.addWall(wall));
    })
  } //tested

  drawPaths(paths) {
    let map = new Path();
    map.fullBoard();
    let amount = [];
    for (let a = 0; a <(boardSquare); a++){
      amount.push([0,0,0,0]);
    }

    paths.forEach((path) =>{
      path.tiles.forEach((tile,index)=>{
        if (index !== (path.tiles.length-1)){
          let next = path.tiles[(index+1)];
          amount[map.findCo(tile)][tile.direction(next)] += 1;
          amount[map.findCo(next)][next.direction(tile)] += 1;
        }
      })
    })

    let max = paths[0].tiles.legnth;
    amount.forEach((directions, index)=>{
     for(let a =0; a<4; a++) {
        if(directions[a] !== 0) {
          //hilighting options needed
          let inAll = directions[a] === max ? true : false;
          this.boardPlayable.insertAdjacentHTML("beforeend", this.addPath(map.tiles[index], a, inAll));
        }
      }
    })
  } //tested

  drawControler() {
    if (innerWidth > innerHeight){
      this.controler.insertAdjacentHTML("beforeend",'<div class="btnSizeDouble btn">PACK TACK</div>');
      this.controler.insertAdjacentHTML("beforeend",'<div class="horizontalSort" id="pathsControler">');
      this.controler.insertAdjacentHTML("beforeend",'<div class="btnSizeDouble btn" id="movesControler"></div>');
      this.controler.insertAdjacentHTML("beforeend",'<div class="btnSize btn" id="resetControler">Reset</div>');
      this.controler.insertAdjacentHTML("beforeend",'<div class="btnSize btn" id="colectedControler"></div>');
      this.controler.insertAdjacentHTML("beforeend",'<div class="btnSizeDouble btn" id="goControler">Go</div>');
      this.controler.insertAdjacentHTML("beforeend",'<div class="horizontalSort" id="statsControler">');
      document.querySelector("#statsControler").insertAdjacentHTML("beforeend",'<div class="btnSize btn" id="totalMovesControler"></div>');
      document.querySelector("#statsControler").insertAdjacentHTML("beforeend",'<div class="btnSize btn" id="turnsControler"></div>');

      this.pathsControler = document.querySelector("#pathsControler");
      this.movesControler = document.querySelector("#movesControler");
      this.resetControler = document.querySelector("#resetControler");
      this.colectedControler = document.querySelector("#colectedControler");
      this.goControler = document.querySelector("#goControler");
      this.totalMovesControler = document.querySelector("#totalMovesControler");
      this.turnsControler = document.querySelector("#turnsControler");
    }else{
      document.querySelector("#mainContainer").insertAdjacentHTML("afterbegin",'<div class="titleControlerControlerSize" id="titleControler">');
      document.querySelector("#titleControler").insertAdjacentHTML("afterbegin",'<div class="btnSizeDouble btn">PACK TACK</div>');




      this.controler.insertAdjacentHTML("beforeend",'<div class="horizontalSort" id="v1Controler">');
      document.querySelector("#v1Controler").insertAdjacentHTML("beforeend",'<div class="btnSizeDouble btn" id="goControler">Go</div>');
      document.querySelector("#v1Controler").insertAdjacentHTML("beforeend",'<div class="btnSizeDouble btn" id="resetControler">Reset</div>');
      this.controler.insertAdjacentHTML("beforeend",'<div class="horizontalSort" id="v2Controler">');
      document.querySelector("#v2Controler").insertAdjacentHTML("beforeend",'<div class="btnSize btn" id="movesControler"></div>');
      document.querySelector("#v2Controler").insertAdjacentHTML("beforeend",'<div class="btnSize btn" id="colectedControler"></div>');
      this.controler.insertAdjacentHTML("beforeend",'<div class="horizontalSort" id="pathsControler">');
      this.controler.insertAdjacentHTML("beforeend",'<div class="horizontalSort" id="statsControler">');
      document.querySelector("#statsControler").insertAdjacentHTML("beforeend",'<div class="btnSize btn" id="totalMovesControler"></div>');
      document.querySelector("#statsControler").insertAdjacentHTML("beforeend",'<div class="btnSize btn" id="turnsControler"></div>');

      this.pathsControler = document.querySelector("#pathsControler");
      this.movesControler = document.querySelector("#movesControler");
      this.resetControler = document.querySelector("#resetControler");
      this.colectedControler = document.querySelector("#colectedControler");
      this.goControler = document.querySelector("#goControler");
      this.totalMovesControler = document.querySelector("#totalMovesControler");
      this.turnsControler = document.querySelector("#turnsControler");
    }
    // this.style.insertAdjacentHTML("beforeend",`stuf`)
    // document.querySelector("#boardPlayable");

  }

  drawWallHilights(hilightedWalls){
    hilightedWalls.forEach((hilighted) => {
      if(hilighted[1] !== "offBoard"){
        this.boardPlayable.insertAdjacentHTML("beforeend", this.addHilightWall(hilighted));
      }
    })
  }

  drawPack(board){
    this.removeClass("pack")
    this.boardPlayable.insertAdjacentHTML("beforeend",`<img src="./modules/pack.svg" id="pack" class="pack row${board.pack.x} column${board.pack.y} tileSize">`)
  }

  addTile(drawTileCo) {
    let file = "./modules/square.svg";
    return `<img src="${file}" id=${drawTileCo.id} class="tileBase row${drawTileCo.x} column${drawTileCo.y} tileSize">`
  } //tested

  addEatMe(drawTileCo) {
    let file = "./modules/eatMe.svg";
    return `<img src="${file}" id=EatMe${drawTileCo.id} class="eatMe row${drawTileCo.x} column${drawTileCo.y} tileSize">`
  }

  addWall(wall) {
    let link="";
    if (wall.vertical){
      link = `<img src="./modules/wallV.svg" id=${wall.id} class="wall row${wall.startCo.x} columnWall${wall.startCo.y} wallSize">`
    }else{
      link = `<img src="./modules/wallH.svg" id=${wall.id} class="wall rowWall${wall.startCo.x} column${wall.startCo.y} tileSize">`
    }
    return link;
  } //tested

  addHilightWall(hilighted) {
    let isActive = (hilighted[1] === "available") ? "activeWallHilight" : "" ;
    let link="";
    if (hilighted[0].vertical){
      link = `<img src="./modules/wallHilightV.svg" id=Hilight${hilighted[0].id} class="wallHilight rowHilight${hilighted[0].startCo.x} columnWallHilight${hilighted[0].startCo.y} WallHilightSizeV ${isActive}">`
    }else{
      link = `<img src="./modules/wallHilightH.svg" id=Hilight${hilighted[0].id} class="wallHilight rowWallHilight${hilighted[0].startCo.x} columnHilight${hilighted[0].startCo.y} WallHilightSizeH ${isActive}">`
    }
    return link;

  } //rename row coum classes

  addPath(drawPathCo, rotate, shouldHilight) {
    return `<img src="./modules/path.svg" id=${"path-"+drawPathCo.id+"-"+rotate} class="path row${drawPathCo.x} column${drawPathCo.y} rotate${rotate} tileSize">`
  } // tested but hilighting options needed

  updateControler(board){
    this.removeClass("pathControler");
    this.pathsControler.insertAdjacentHTML("beforeend",`<div class="btnSize btn pathControler" id="pathControler${0+1}">${0+1}</div>`);
    this.movesControler.innerText = `Moves: ${master.movesAvailable}`;
    this.colectedControler.innerText = `${board.eaten}/${boardSquare}`;
    this.totalMovesControler.innerText = `Total Moves: ${board.movesTaken}`;
    this.turnsControler.innerText = `Turns: ${master.turns}`;
  }

  updateGoals(board){
    this.removeClass("goal");
    board.goals.forEach(goal=>{
      console.log(goal)
    this.boardPlayable.insertAdjacentHTML("beforeend",`<img src="./modules/${goal.name}.svg" id="goal${goal.co.id}" class="goal row${goal.co.x} column${goal.co.y} tileSize">`);
    })
  }

  removeId(removeid){document.getElementById(removeid).remove();} // tested

  removeClass(classId){
    let classes = document.querySelectorAll("."+classId);
    classes.forEach(classs => classs.remove())
  } // tested

  packAnimate(co,dir){
    const pack = document.querySelector("#pack");
    let point = dir == 0 ? 3: dir - 1 ;
    pack.classList.add(`rotate${(point)}`);
    let posX = (co.x * this.tileSize);
    let posY = (co.y * this.tileSize);
    let pY = 0;
    let nY = 0;
    let pX = 0;
    let nX = 0;
    let finalX = posX;
    let finalY = posY;
    let interval = null;
    switch(dir){
      case 0:
        finalX -= this.tileSize;
        nX = 2;
        break;
      case 1:
        finalY += this.tileSize;
        pY = 2;
        break;
      case 2:
        finalX += this.tileSize;
        pX = 2;
        break;
      case 3:
        finalY -= this.tileSize;
        nY = 2;
        break;
    }
    clearInterval(interval);
    console.log(posY)
    console.log(finalY)

    interval = setInterval((frame) => {
      console.log(posY)
      if (posX >= finalX && posY >= finalY &&(dir == 1||dir == 2)||posX <= finalX && posY <= finalY &&(dir == 0||dir == 3)) {
        clearInterval(interval);
        master.packMove();
      } else {
        posX = posX + pX - nX;
        posY = posY + pY - nY;
        pack.style.top = posX + 'px';
        pack.style.left = posY + 'px';
      }
    }, 1);
  }

  addControlerListeners(){
    this.goControler.addEventListener("click", this.goClicked);
    this.resetControler.addEventListener("click", this.resetClicked);
    let pathsListeners = document.querySelectorAll(".pathControler")
    pathsListeners.forEach((pathListen)=>{
      pathListen.addEventListener("click", this.pathClicked);
    })
  }

  removeControlerListeners(){
    this.goControler.removeEventListener("click", this.goClicked);
    this.resetControler.removeEventListener("click", this.resetClicked);
    let pathsListeners = document.querySelectorAll(".pathControler")
    pathsListeners.forEach((pathListen)=>{
      pathListen.removeEventListener("click", this.pathClicked);
    })
  }

  addAllWallListeners(){
    let listeners = document.querySelectorAll(".wall")
    listeners.forEach((listen)=>{
      listen.addEventListener("click", this.listenToAllWalls);
    })
  }

  removeAllWallListeners(){
    let listeners = document.querySelectorAll(".wall")
    listeners.forEach((listen)=>{
    listen.removeEventListener("click", this.listenToAllWalls);
    })
  }

  addMoveWallListeners(){
    let listeners = document.querySelectorAll(".activeWallHilight")
    listeners.forEach((listen)=>{
      listen.addEventListener("click", this.moveWallListener);
    })
  } //done

  moveWallListener(event){
    console.log( event.target.id );
    master.ChangeWall(event.target.id)
  }// done

  listenToAllWalls(event){
    console.log( event.target.id );
    master.wallSelected(event.target.id);
  }

  goClicked(){
    console.log('GO');
    master.packMove();
  }

  resetClicked(){
    console.log('reset');
    master.reset();
  }

  pathClicked(event){
    console.log(`${event.target.id}`);

  }

  setCssSizes(){
    let boardMax = innerWidth > innerHeight ? innerHeight :  innerWidth;
    let screenHoizontal = innerWidth > innerHeight ? true :  false;
    let tileSize = Math.floor(boardMax / boardSize);
    this.tileSize = tileSize;
    boardMax = boardMax - (boardMax % boardSize)
    console.log(boardMax)
    console.log(tileSize)

    let tileScale = tileSize/100.0;
    let hilightScale = 1.2;
    let halfWallWidth = Math.floor(10 * tileScale); //ajust for rounding?
    let wallHiglightSize = Math.floor(tileSize * hilightScale); //ajust for rounding?
    let halfHilighWidthDiference = Math.floor(((hilightScale-1)/2)*tileSize); //ajust for rounding?
    let halfHilighHeightDiference = Math.floor(10 * tileScale *  hilightScale); //ajust for rounding?

    let btnSize = boardMax / 10;

    this.style.insertAdjacentHTML("afterbegin", `.boardPlayableSize{width: ${boardMax}px; height: ${boardMax}px;}`);
    this.style.insertAdjacentHTML("afterbegin", `.tileSize{width: ${tileSize}px;}`);
    this.style.insertAdjacentHTML("afterbegin", `.wallSize{height: ${tileSize}px;}`);
    this.style.insertAdjacentHTML("afterbegin", `.WallHilightSizeH{width: ${wallHiglightSize}px;}`);
    this.style.insertAdjacentHTML("afterbegin", `.WallHilightSizeV{height: ${wallHiglightSize}px;}`);

    for(let g = 0;g < boardSize; g++){
      this.style.insertAdjacentHTML("afterbegin", `.row${g}{top: ${tileSize * g}px;}`);
      this.style.insertAdjacentHTML("afterbegin", `.column${g}{Left: ${tileSize * g}px;}`);
      this.style.insertAdjacentHTML("afterbegin", `.rowWall${g}{top: ${((tileSize * (g+1))-halfWallWidth)}px;}`);
      this.style.insertAdjacentHTML("afterbegin", `.columnWall${g}{Left: ${((tileSize * (g+1))-halfWallWidth)}px;}`);
      this.style.insertAdjacentHTML("afterbegin", `.rowHilight${g}{top: ${((tileSize * g) - halfHilighWidthDiference)}px;}`);
      this.style.insertAdjacentHTML("afterbegin", `.columnHilight${g}{Left: ${((tileSize * g)-halfHilighWidthDiference)}px;}`);
      this.style.insertAdjacentHTML("afterbegin", `.rowWallHilight${g}{top: ${((tileSize * (g+1))-halfHilighHeightDiference)}px;}`);
      this.style.insertAdjacentHTML("afterbegin", `.columnWallHilight${g}{Left: ${((tileSize * (g+1))-halfHilighHeightDiference)}px;}`);
    }

    if(screenHoizontal){
      this.style.insertAdjacentHTML("afterbegin", `.mainControlerSize{width: ${(boardMax/2)}px; height:${boardMax}}`);
    }else{
      this.style.insertAdjacentHTML("afterbegin", `.mainControlerSize{width: ${boardMax}px; height:${(boardMax/2)}}`);
      this.style.insertAdjacentHTML("afterbegin", `.titleControlerControlerSize{width: ${boardMax}px;}`);
      this.style.insertAdjacentHTML("afterbegin", `.mainContainerDir{flex-direction:column;}`);
    }

    this.style.insertAdjacentHTML("afterbegin", `.btnSize{font-size: ${Math.floor(boardMax / 20)}px; height:${Math.floor(btnSize-4)}px}`);
    this.style.insertAdjacentHTML("afterbegin", `.btnSizeDouble{font-size: ${Math.floor(boardMax / 14)}px; height:${Math.floor((btnSize * 2)-4)}px}`);


    console.log(this.style.innerHTML)
  }
}

class Gamemaster {
  constructor() {
    this.gameBoard = new Board();
    this.view = new ViewHtml();
    this.selectedWall = null
    this.shortestPaths = []
    this.shortPath = 0;
    this.movePostion = 0;
    this.backup =new Board();
    this.movesAvailable = 4;
    this.turns = 1;
  }

  setUp(){
    this.gameBoard.setUp();
    this.gameBoard.randomiseWalls((boardSize - 1)*(boardSize - 1));
    console.log(this.gameBoard.walls);
    this.view.setUp(this.gameBoard);
    this.gameBoard.movePack(this.gameBoard.randomFromQuadrent(0))
    this.backup = this.gameBoard.copy()
    this.selectAnyWall();
  } // tested for now

  selectAnyWall(){
    this.view.removeClass("path");
    this.view.updateControler(this.gameBoard)
    this.shortestPaths = this.gameBoard.shortestPath(this.gameBoard.pack, this.gameBoard.goals[0].co);
    this.view.drawPaths(this.shortestPaths);
    if(this.movesAvailable>0){
      this.view.addAllWallListeners();
    }
    this.view.addControlerListeners();
  }

  wallSelected(wallId){
    this.view.removeAllWallListeners();
    this.view.removeControlerListeners();
    let hilightedWalls = this.gameBoard.wallMoveHilight(wallId)
    console.log(hilightedWalls);
    this.selectedWall = hilightedWalls[0][0].copy()

    this.view.drawWallHilights(hilightedWalls)
    this.view.addMoveWallListeners();

  }

  ChangeWall(wallId){
    let araryOfStrings = wallId.slice(7).split("-");
    let newWall=new Wall([Math.floor(araryOfStrings[0]), Math.floor(araryOfStrings[1]), Math.floor(araryOfStrings[2]), Math.floor(araryOfStrings[3])]);
    console.log(newWall);
    this.gameBoard.removeWall(this.selectedWall.array);
    this.view.removeId(this.selectedWall.id)
    this.gameBoard.addWall(newWall.array);
    //this.view.addWall(newWall);
    this.view.boardPlayable.insertAdjacentHTML("beforeend", this.view.addWall(newWall));
    this.view.removeClass("wallHilight");
    //maybe remove listners, test if needed?
    this.gameBoard.movesTaken +=1;
    this.movesAvailable -= 1;
    this.selectAnyWall();


  } // to be called by moveWallListners

  packMove(){
    this.view.removeAllWallListeners();
    this.view.removeControlerListeners();

    let path = this.shortestPaths[this.shortPath];

    if(this.movePostion === (path.tiles.length - 1)){
      this.gameBoard.movePack(path.tiles[this.movePostion])
      this.gameBoard.makeGoal()
      this.gameBoard.goals.shift();
      this.view.updateGoals(this.gameBoard);
      this.movePostion = 0;
      this.movesAvailable = 4;
      this.turns += 1;
      this.backup = this.gameBoard.copy()
      this.selectAnyWall();

    }else{
      this.gameBoard.movePack(path.tiles[this.movePostion])
      let dir = path.tiles[this.movePostion].direction(path.tiles[this.movePostion+1])
      this.view.packAnimate(this.gameBoard.pack,dir);
      this.movePostion ++ ;
    }


  }

  reset(){
    this.gameBoard = this.backup.copy();
    this.movesAvailable = 4;
    this.view.removeClass("wall")
    this.view.drawWalls(this.gameBoard);
    this.selectAnyWall();
  }


}//Tested but has test code in it

// REAL CODE HERE
master= new Gamemaster;
master.setUp();
//REAL CODE END

// const viewTest = new ViewTerminal

// tt1=new Co(1, 1)
// console.log(tt1.direction(new Co(0, 1)))
// console.log(tt1.direction(new Co(1, 2)))
// console.log(tt1.direction(new Co(2, 1)))
// console.log(tt1.direction(new Co(1, 0)))

// const b = new Board();
// b.setUp();
// b.addTile(0, 0);
// b.addTile(0, 1);
// b.addTile(1, 0);
// b.addTile(1, 1);
// const bb = new Board();
// bb.become(b)
// b.addWall([1,0,2,0]);
// b.addWall([2,0,2,1]);
// console.log(b.tiles[6]);
// console.log(b.randomWall());
// b.testCopy();
// console.log(b.copy());
// // b.randomiseWalls(15);
// b.addWall([0,0,0,1]);
// b.addWall([1,0,1,1]);
// // b.addWall([2,1,2,2]);
// // b.addWall([0,1,1,1]);
// // let w = new Wall([0,0,0,1])
// // let u = w.copy();
// // u.id="changed"
// // b.removeWall([0,0,0,1]);
// let gb = new Board();
// gb.become(b)
// console.log(gb.walls);

// b.addWall([0,0,1,0]);
// b.addWall([0,1,1,1]);
// b.addWall([0,3,1,3]);
// b.addWall([1,2,2,2]);
// b.addWall([3,1,3,2]);
// b.addWall([0,2,1,2]);  //breaks it size 4
// console.log(b.splitBoard());
// console.log(b);

// let p = b.shortestPath(new Co(0,0), new Co(2,2) );
// const p =b.shortestPath(new Co(0,0), new Co(4,4) );

// p.forEach(path => viewTest.drawPath(b,path) )
//viewTest.drawWallsThin(b);
//list2=new Path;
//list2.maxLenths();
// list.tiles.push(9);
// list.tiles.push(9);
//console.log(list2);

// const p = new Path();
// p.traveled += 1;
// p.addCo(new Co(0, 0) )
// p.addCo(new Co(1, 0) )
// p.addCo(new Co(1, 1) )
// p.addCo(new Co(1, 2) )
// p.addCo(new Co(0, 2) )
// p.addCo(new Co(0, 1) )
//console.log(p.findCo(new Co({x:1, y:1,})));
// console.log(p.root());
// p.remove(1);
// console.log(p);
// console.log(p.findCo(new Co(2, 2)));
// const f = new Path();
// f.fullBoard();
// console.log(f.tiles);

// viewTest.drawPath(b,p);

//b.addWall([0,0,1,0]);
//b.removeWall([0,0,1,0]);
//const c = b.copy();
//console.log(b);
//console.log(b.findI(0,0).walls);
//console.log(c.findI(0,1).walls);
//console.log(b.findI(0,1).walls);
//console.log(b.findI(1,0).walls);
//console.log(b.findI(1,1).walls);
// const c = b.copy();
// c.findI(0,0).occupide = true;

// console.log(b.findI(0,0));
// console.log(c.findI(0,0));

// console.log(b.randomWall());
// console.log(b.randomWall());
// console.log(b.randomWall());
// console.log(b.randomWall());

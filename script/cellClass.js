class Cell {
  constructor(
    htmlRef,
    row,
    col,
    isStart = false,
    isTarget = false,
    isWall = false,
    weight = 1,
  ) {
    this.htmlRef = htmlRef;
    this.row = row;
    this.col = col;
    this.isStart = isStart;
    this.isTarget = isTarget;
    this.isWall = isWall;
    this.weight = weight;
  }
}

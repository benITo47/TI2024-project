class Cell {
  constructor(
    htmlRef,
    row,
    col,
    isStart = false,
    isTarget = false,
    isWall = false,
  ) {
    this.htmlRef = htmlRef;
    this.row = row;
    this.col = col;
    this.isStart = isStart;
    this.isTarget = isTarget;
    this.isWall = isWall;
  }
}

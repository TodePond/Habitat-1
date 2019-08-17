//===========//
// Direction //
//===========//
class Direction {
	constructor(x, y, z) {
		this.x = x
		this.y = y
		this.z = z
	}
}

const Still = new Direction(0, 0, 0)
const Left = new Direction(-1, 0, 0)
const Right = new Direction(1, 0, 0)
const Up = new Direction(0, 1, 0)
const Down = new Direction(0, -1, 0)
const Forward = new Direction(0, 0, 1)
const Backward = new Direction(0, 0, -1)
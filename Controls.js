//==========//
// Keyboard //
//==========//
const Keyboard = {}

on.keydown(event => {
	Keyboard[event.key] = true
})

on.keyup(event => {
	Keyboard[event.key] = false
})

{
	let d
	Reflect.defineProperty(Keyboard, "d", {
		get: o=> d,
		set: (v) => d = v,
	})
}

//========//
// Cursor //
//========//
const Cursor = {
	down: undefined,
	x: undefined,
	y: undefined,
}

on.mousedown(event => {
	Cursor.down = true
})

on.mouseup(event => {
	Cursor.down = false
})

on.mousemove(event => {
	Cursor.x = event.clientX
	Cursor.y = event.clientY
})
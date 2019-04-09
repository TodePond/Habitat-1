/*=======//
// Array //
//=======*/
Reflect.defineProperty(Array.prototype, "last", {
	get() {
		return this[this.length-1]
	},
})

Reflect.defineProperty(Array.prototype, "reversed", {
	get() {
		const reversed = []
		for (let i = this.length-1; i >= 0; i--) {
			reversed.push(this[i])
		}
		return reversed
	},
})

Reflect.defineProperty(Array.prototype, "first", {
	get() {
		return this[0]
	}
})

/*=====//
// Set //
//=====*/
Reflect.defineProperty(Set.prototype, "first", {
	get() {
		return this.values().first
	}
})

Reflect.defineProperty(Set.prototype, "last", {
	get() {
		return this.values().last
	}
})

Reflect.defineProperty(Set.prototype, "reversed", {
	get() {
		return this.values().reversed
	}
})

Reflect.defineProperty(Set.prototype, "length", {
	get() {
		return this.size
	},
})
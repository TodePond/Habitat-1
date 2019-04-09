Reflect.defineProperty(Object.prototype, "is", {
	value(type) {
		if (type instanceof Type) return type.check(this)
		return this instanceof type
	}
})

Reflect.defineProperty(Object.prototype, "as", {
	value(type) {
		if (type instanceof Type) return type.convert(this)
		try {
			return type(this)
		} 
		catch(e) {}
	}
})

class Type {
	constructor({check, convert}) {
		this.check = check
		this.convert = convert
	}
}

const Even = new Type ({
	check(n) {
		return n % 2 == 0
	}
})

const Odd = new Type ({
	check(n) {
		return n % 2 != 0
	}
})

const Positive = new Type ({
	convert(n) {
		return Math.abs(n)
	}
})
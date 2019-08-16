Reflect.defineProperty(Object.prototype, "is", {
	value(type) {
		if (type instanceof Type) return type.check(this)
		try   { return this instanceof type }
		catch { return false }
	}
})

Reflect.defineProperty(Object.prototype, "as", {
	value(type) {
		if (type instanceof Type) return type.convert(this)
		try {
			return type(this)
		} 
		catch {}
	}
})

Reflect.defineProperty(Object.prototype, "and", {
	value(type2) {
		const type1 = this
		return new Type ({
			check: (v) => v.is(type1) && v.is(type2),
			convert: (v) => v.as(type1).as(type2),
			depth: Math.max(getTypeDepth(type1), getTypeDepth(type2)) + 1,
		})
	}
})

Reflect.defineProperty(Object.prototype, "or", {
	value(type2) {
		const type1 = this
		return new Type ({
			check: (v) => v.is(type1) || v.is(type2),
			convert: (v) => {
				try   { return v.as(type1).as(type2)}
				catch { 
					try   { return v.as(type1) }
					catch { return v.as(type2) }
				}
			},
			depth: Math.min(getTypeDepth(type1), getTypeDepth(type2)) - 0.01,
		})
	}
})

class Type {
	constructor({check, convert, depth = 2}) {
		this.check = check
		this.convert = convert
		this.depth = depth
	}
}

const Any = new Type({
	check(n) {
		return true
	},
	depth: -1,
})

const Int = new Type({
	check: n => n % 1 == 0,
	convert: n => parseInt(n),
})

const Even = new Type({
	check(n) {
		return n % 2 == 0
	}
})

const Odd = new Type({
	check(n) {
		return n % 2 != 0
	}
})

const Positive = new Type({
	check(n) {
		return n >= 0
	},
	convert(n) {
		return Math.abs(n)
	}
})

const UInt = Int.and(Positive)

const UpperCase = new Type({
	check(s) {
		return s == s.as(UpperCase)
	},
	convert(s) {
		return s.toUpperCase()
	}
})

const LowerCase = new Type({
	check(s) {
		return s == s.as(LowerCase)
	},
	convert(s) {
		return s.toLowerCase()
	}
})

const Capitalised = new Type({
	check(s) {
		return s[0] == s[0].as(UpperCase)
	},
	convert(s) {
		return s.slice(0, 1).as(UpperCase) + s.slice(1)
	}
})

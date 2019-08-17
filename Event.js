//=========//
// Element //
//=========//
Reflect.defineProperty(Element.prototype, "on", {
	get() {
		return new Proxy(this, {
			get: (element, eventName, callback) => (callback) => element.addEventListener(eventName, callback),
		})
	},
})

Reflect.defineProperty(NodeList.prototype, "on", {
	get() {
		return new Proxy(this, {
			get: (nodelist, eventName, callback) => (callback) => nodelist.forEach(element => element.addEventListener(eventName, callback)),
		})
	},
})

Reflect.defineProperty(window, "on", {
	get() {
		return new Proxy(this, {
			get: (element, eventName, callback) => (callback) => element.addEventListener(eventName, callback),
		})
	},
})

//========//
// Object //
//========//
{
	
	Reflect.defineProperty(Object.prototype, "addEventListener", {
		value(...args) {
			const eventTarget = summonEventTarget(this)
			return eventTarget.addEventListener(...args)
		},
		writable: true,
	})
	
	Reflect.defineProperty(Object.prototype, "dispatchEvent", {
		value(...args) {
			const eventTarget = summonEventTarget(this)
			return eventTarget.dispatchEvent(...args)
		},
		writable: true,
	})
	
	Reflect.defineProperty(Object.prototype, "removeEventListener", {
		value(...args) {
			const eventTarget = summonEventTarget(this)
			return eventTarget.removeEventListener(...args)
		},
		writable: true,
	})
	
	Reflect.defineProperty(Object.prototype, "on", {
		get() {
			return new Proxy(this, {
				get: (object, eventName, callback) => (callback) => object.addEventListener(eventName, callback),
			})
		},
	})
	
	const EVENT_TARGET_SYMBOL = Symbol("EventTarget")
	const getEventTarget = (object) => object[EVENT_TARGET_SYMBOL]
	
	const createEventTarget = (object) => {
		const eventTarget = new EventTarget()
		Reflect.defineProperty(object, EVENT_TARGET_SYMBOL, {value: eventTarget})
		return eventTarget
	}
	
	const summonEventTarget = (object) => {
		const eventTarget = getEventTarget(object)
		if (!eventTarget) return createEventTarget(object)
		return eventTarget
	}
	
}

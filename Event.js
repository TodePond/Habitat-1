//=======//
// Event //
//=======//
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

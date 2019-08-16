class Report {
	constructor(data) {
		
		for (const propertyName in data) {
			const property = data[propertyName]
			this[propertyName] = property
		}
		
		if (!this.has("success")) this.success = true
		
		const proxy = new Proxy(this, {
		
			get(report, propertyName) {
				if (!report.has(propertyName)) throw new Error(`[Report] Tried to look for '${propertyName}' in report, but it isn't there.`)
				return report[propertyName]
			},
			
			getOwnPropertyDescriptor(report, propertyName) {
				if (!report.has(propertyName)) throw new Error(`[Report] Tried to look for '${propertyName}' in report, but it isn't there.`)
				return Reflect.getOwnPropertyDescriptor(report, propertyName)
			},
			
			defineProperty() {
				throw new Error(`[Report] Tried to change a report. Can't do that.`)
			}
		})
		
		return proxy
	}
}
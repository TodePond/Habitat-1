//=======//
// Match //
//=======//
{
	
	function matchValueToArgs(value, ...args) {
		
		const rules = readRulesArgs(args)
		const ruleReport = matchValueToRules(value, rules)
		if (!ruleReport.success) return
		
		const rule = ruleReport.rule
		const output = rule.output
		
		if (output.is(Function)) return output(value)
		return output
	}
	
	class Rule {
		constructor(pattern, output) {
			this.pattern = pattern
			this.output = output
		}
	}
	
	function readRulesArgs(args) {
		const rules = []
		args.o.forEach.x= (arg, i) => {
			if (i.is(Even)) rules.push(new Rule(arg))
			else rules.last.output = arg
		}
		return rules
	}
	
	function matchValueToRules(value, rules) {
		
		const trueReport = checkTrueMatch(value, rules)
		if (trueReport.success) return new Report({
			rule: trueReport.rule,
			depth: 4,
			innerDepth: 0,
		})
		
		if (value === undefined) return new Report({
			success: false,
			depth: 0,
			innerDepth: 0,
		})
		
		const exactReport = checkExactMatch(value, rules)
		if (exactReport.success) return new Report({
			rule: exactReport.rule,
			depth: 3,
			innerDepth: 0,
		})
		
		const typeReport = checkTypeMatch(value, rules)
		if (typeReport.success) return new Report({
			rule: typeReport.rule,
			depth: 2,
			innerDepth:	typeReport.depth,
		})
		
		const arrayReport = checkArrayMatch(value, rules)
		if (arrayReport.success) return new Report({
			rule: arrayReport.rule,
			depth: arrayReport.depth,
			innerDepth: arrayReport.innerDepth,
		})
		
		return new Report({
			success: false,
			depth: 0,
			innerDepth: 0,
		})
	}
	
	//========//
	// CHECKS //
	//========//
	function checkTrueMatch(value, rules) {
		for (const rule of rules) {
			if (rule.pattern === true) return new Report({rule})
		}
		
		return new Report({success: false})
	}
	
	function checkExactMatch(value, rules) {
		for (const rule of rules) {
			const pattern = rule.pattern
			if (value === pattern) return new Report({rule})
		}
		
		return new Report({success: false})
	}
	
	function checkTypeMatch(value, rules) {
		
		const matches = []
		
		for (const rule of rules) {
			const type = rule.pattern
			if (value.is(type)) matches.push(rule)
		}
		
		if (matches.length == 0) return new Report({success: false})
		
		const deepestMatch = matches.reduce((a, b) => {
			const aDepth = getTypeDepth(a.pattern)
			const bDepth = getTypeDepth(b.pattern)
			if (aDepth > bDepth) return a
			return b
		})
		
		return new Report({rule: deepestMatch, depth: getTypeDepth(deepestMatch.pattern)})
	}
	
	getTypeDepth = function(type) {
		if (type.is(Type)) return type.depth
		if (type == Object) return 0
		if (type == Function) return 1
		if (type == Number) return 1
		if (type == String) return 1
		if (type == Boolean) return 1
		if (type == Array) return 1
		return 2
	}
	
	function checkArrayMatch(value, rules) {
		
		if (!value.is(Array)) return new Report({success: false})
		
		const array = value
		const matches = []
		
		for (const rule of rules) {
			const pattern = rule.pattern
			if (!pattern.is(Array)) continue
			if (pattern.length == array.length) matches.push(rule)
		}
		
		if (matches.length == 0) return new Report({success: false})
		
		const deepestMatch = matches.reduce((a, b) => {
		
			const aDeepest = getDeepestMatchInArray(array, a.pattern)
			const bDeepest = getDeepestMatchInArray(array, b.pattern)
			
			if (aDeepest.depth > bDeepest.depth) return a
			if (aDeepest.depth == bDeepest.depth && aDeepest.innerDepth > bDeepest.innerDepth) return a
			return b
		})
		
		return new Report({rule: deepestMatch, depth: deepestMatch.depth, innerDepth: deepestMatch.innerDepth})
	}
	
	function getDeepestMatchInArray(array, arrayPattern) {
	
		const matches = []
	
		// assuming they are the same length
		for (const i in array) {
			const value = array[i]
			const pattern = arrayPattern[i]
			const rule = new Rule(pattern)
			const matchReport = matchValueToRules(value, [rule])
			matches.push(matchReport)
		}
		
		const deepestMatch = matches.reduce((a, b) => {
			if (a.depth > b.depth) return a
			if (a.depth == b.depth) return a
			else return b
		})
		
		return deepestMatch
	}
	
	//==============//
	// Syntax Sugar //
	//==============//
	match = (...args) => {
		if (args.length.is(Odd)) return matchValueToArgs(...args)
		else return matchValueToArgs(undefined, ...args)
	}
	
	matcher = (...rules) => (...args) => match(args, ...rules)
	
	Reflect.defineProperty(Object.prototype, "match", {
		value(...rules) {
			return match(this.valueOf(), ...rules)
		}
	})
	
	const stringMatch = String.prototype.match
	
	Reflect.defineProperty(String.prototype, "match", {
		value(...args) {
			if (args.length == 1) return stringMatch.apply(this, args)
			return match(this.valueOf(), ...args)
		}
	})
	
}

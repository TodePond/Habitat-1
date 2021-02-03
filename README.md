<img align="right" height="100" src="http://todepond.com/IMG/RibbitTode.png">

# Habitat
Habitat is a collection of javascript libraries.<br>
Here are a few of its features.


# Properties
Edit property definitions with the underscore (`_`) proxy. 
```js
luke._.fullName.get = (self) => `${self.firstName} ${self.lastName}`

luke.fullname //"Luke Wilson"
```

You can specify the type of a property.
```js
luke._.name.type = Text

luke.name = 24 //Type Error!
```

# Types
You can do a type check.
```js
"Luke".is(String)
(25).is(Number)
[6, 8].is(Array)
```

You can do a type conversion.
```js
"24".as(Number)
(24).as(String)
```

You can make your own type.
```js
const UpperCase = new Type({
	check: (s) => s == s.as(UpperCase),
	convert: (s) => s.toUpperCase(),
})

"HELLO".is(UpperCase) //true
```

# Matching
You can pattern match a value.
```js
match (input,
    String,     "It's a string",
    "Luke",     "It's my name",
    [Int, Int], "It's a list of two integers",
    Any,        "It's something else",
)
```

You can make a function that pattern matches its arguments.
```js
const fibonacci = matcher (
    [0], 0,
    [1], 1,
    [UInt], n => fibonacci(n-1) + fibonacci(n-2),
)
```

# Bracketless
You can call functions without brackets.
```js
print.x= "Hello world!"

friends.o.forEach.x= friend => print(`Hello ${friend}`)
```

You can assign multiple properties to an object at once.
```js
luke.o={
    name: "Luke",
    age: 25,
}
```

# Other Stuff
Check out the [wiki](https://github.com/l2wilson94/Habitat/wiki).

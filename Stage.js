
class Stage {
	
	constructor(parent) {
	
		this.canvas = this.makeCanvas()
		parent.appendChild(this.canvas)
		
		this.renderer = new THREE.WebGLRenderer({canvas: this.canvas})
		this.scene = new THREE.Scene()
		this.camera = this.makeCamera()
		
		this.raycaster = new THREE.Raycaster()
		
		this.Cursor = {}
		this.Cursor._.x.get = o=> Cursor.x / this.canvas.clientWidth * 2 - 1
		this.Cursor._.y.get = o=> Cursor.y / this.canvas.clientHeight * -2 + 1
		
		this.Cursor._.position.get = o=> this.getCursorPosition()
		
		this.previousTotalTime = 0
		requestAnimationFrame(this.o.render)
	}
	
	makeCanvas() {
		const style = `
			width: 100%;
			height: 100%;
			display: block;
		`
		return HTML `<canvas style="${style}"></canvas>`
	}
	
	makeCamera() {
		const camera = new THREE.PerspectiveCamera()
		camera.fov = 30
		camera.position.set(0, 50, 75)
		camera.lookAt(0, 0, 0)
		return camera
	}
	
	render(totalTimeMilliseconds) {
	
		const totalTime = totalTimeMilliseconds * 0.001
		const tickTime = totalTime - this.previousTotalTime
		
		this.process(tickTime)
		this.resize()
		this.renderer.render(this.scene, this.camera)
		
		this.previousTotalTime = totalTime
		requestAnimationFrame(this.o.render)
	}
	
	process(tickTime) {
		const processEvent = new CustomEvent("process", {detail: {tickTime}})
		this.dispatchEvent(processEvent)
	}
	
	resize() {
		
		if (!this.canvas) throw new Error("Can't resize stage because it doesn't have a canvas.")
		if (!this.renderer) throw new Error("Can't resize stage because it doesn't have a renderer.")
		
		if (this.canvas.width == this.canvas.clientWidth && this.canvas.height == this.canvas.clientHeight) return
		this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false)
		
		if (!this.camera) return 
		this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
		this.camera.updateProjectionMatrix()
		
	}
	
	getCursorPosition() {
		this.raycaster.setFromCamera(this.Cursor, this.camera)
		const intersects = this.raycaster.intersectObjects(this.scene.children)
		if (intersects.length == 0) return
		const intersect = intersects[0]
		return intersect.point
	}
	
}

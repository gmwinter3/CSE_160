class LineStrip {
    constructor() {
        this.type = 'lineStrip';
        this.points = []; // Array of [x, y] coords
        this.color = [1.0, 1.0, 1.0, 1.0];
    }

    addPoint(x, y) {
        this.points.push(x, y); // flattening [x, y] into single array
    }

    render() {
        if (this.points.length < 4) return; // need at least 2 points

        // Create buffer
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.STATIC_DRAW);

        // Set attribute and uniforms
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniform1f(u_Size, 1.0); // Not used in lines, but required by shader

        // Draw the line strip
        gl.drawArrays(gl.LINE_STRIP, 0, this.points.length / 2);
    }
}

class Sphere {
    constructor(segments = 10) {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.useTexture = false;
        this.textureNum = 10;
        this.segments = segments;
        this.numVertices = 0;
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.uvBuffer = null;

        this.buildSphere();
    }

    buildSphere() {
        const vertices = [];
        const normals = [];
        const uvs = [];
        const d = Math.PI / this.segments;

        for (let t = 0; t < Math.PI; t += d) {
            for (let r = 0; r < 2 * Math.PI; r += d) {
                const p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)];
                const p2 = [Math.sin(t + d) * Math.cos(r), Math.sin(t + d) * Math.sin(r), Math.cos(t + d)];
                const p3 = [Math.sin(t) * Math.cos(r + d), Math.sin(t) * Math.sin(r + d), Math.cos(t)];
                const p4 = [Math.sin(t + d) * Math.cos(r + d), Math.sin(t + d) * Math.sin(r + d), Math.cos(t + d)];

                // Triangle 1
                vertices.push(...p1, ...p2, ...p4);
                normals.push(...p1, ...p2, ...p4);
                uvs.push(0, 0, 0, 1, 1, 1);

                // Triangle 2
                vertices.push(...p1, ...p4, ...p3);
                normals.push(...p1, ...p4, ...p3);
                uvs.push(0, 0, 1, 1, 1, 0);
            }
        }

        this.numVertices = vertices.length / 3;

        this.vertexBuffer = this.initArrayBuffer(new Float32Array(vertices), 3, a_Position);
        this.normalBuffer = this.initArrayBuffer(new Float32Array(normals), 3, a_Normal);
        this.uvBuffer = this.initArrayBuffer(new Float32Array(uvs), 2, a_UV);
    }

    initArrayBuffer(data, num, attribute) {
        const buffer = gl.createBuffer();
        if (!buffer) {
            console.log('Failed to create buffer object');
            return null;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attribute, num, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribute);
        return buffer;
    }

    render() {
        gl.uniform1i(u_UseTexture, this.textureNum);
        gl.uniform4f(u_FragColor, ...this.color);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Rebind attributes before draw in case other objects modified the bindings
        this.bindBuffer(this.vertexBuffer, 3, a_Position);
        this.bindBuffer(this.normalBuffer, 3, a_Normal);
        this.bindBuffer(this.uvBuffer, 2, a_UV);

        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }

    bindBuffer(buffer, size, attribute) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribute);
    }
}

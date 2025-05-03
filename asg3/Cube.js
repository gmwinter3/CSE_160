class Cube{
    constructor(){
        this.type = 'cube';
//        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
//        this.size = 5.0;
//        this.segments = g_circleSegments;
        this.matrix = new Matrix4();

        this.cubeVerts = [
                // Front
                0, 0, 0,  1, 1, 0,  1, 0, 0,
                0, 0, 0,  0, 1, 0,  1, 1, 0,
                // Back
                0, 0, 1,  1, 0, 1,  1, 1, 1,
                0, 0, 1,  1, 1, 1,  0, 1, 1,
                // Top
                0, 1, 0,  0, 1, 1,  1, 1, 1,
                0, 1, 0,  1, 1, 1,  1, 1, 0,
                // Bottom
                0, 0, 0,  1, 0, 1,  1, 0, 0,
                0, 0, 0,  0, 0, 1,  1, 0, 1,
                // Left
                0, 0, 0,  0, 1, 0,  0, 1, 1,
                0, 0, 0,  0, 1, 1,  0, 0, 1,
                // Right
                1, 0, 0,  1, 1, 1,  1, 1, 0,
                1, 0, 0,  1, 0, 1,  1, 1, 1
            ];

            this.cubeVerts32 = new Float32Array(this.cubeVerts);

    }

    render() {
 //       var xy = this.position;
        var rgba = this.color;
//       var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to uModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face
        drawTriangle3D([0, 0, 0,  1, 1, 0,  1, 0, 0]);
        drawTriangle3D([0, 0, 0,  0, 1, 0,  1, 1, 0]);

        // Back face (full color like front)
        drawTriangle3D([0, 0, 1,  1, 0, 1,  1, 1, 1]);
        drawTriangle3D([0, 0, 1,  1, 1, 1,  0, 1, 1]);

        // Slightly darker color for shaded faces
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top face (already in your code)
        drawTriangle3D([0, 1, 0,  0, 1, 1,  1, 1, 1]);
        drawTriangle3D([0, 1, 0,  1, 1, 1,  1, 1, 0]);

        // Bottom face
        drawTriangle3D([0, 0, 0,  1, 0, 1,  1, 0, 0]);
        drawTriangle3D([0, 0, 0,  0, 0, 1,  1, 0, 1]);

        // Left face
        drawTriangle3D([0, 0, 0,  0, 1, 0,  0, 1, 1]);
        drawTriangle3D([0, 0, 0,  0, 1, 1,  0, 0, 1]);

        // Right face
        drawTriangle3D([1, 0, 0,  1, 1, 1,  1, 1, 0]);
        drawTriangle3D([1, 0, 0,  1, 0, 1,  1, 1, 1]);
    }

    renderFast() {
 //       var xy = this.position;
        var rgba = this.color;
//       var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to uModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const vertices = [];
        // Front face
        vertices.push(0, 0, 0,  1, 1, 0,  1, 0, 0);
        vertices.push(0, 0, 0,  0, 1, 0,  1, 1, 0);
        // Back face
        vertices.push(0, 0, 1,  1, 0, 1,  1, 1, 1);
        vertices.push(0, 0, 1,  1, 1, 1,  0, 1, 1);
        // Top face
        vertices.push(0, 1, 0,  0, 1, 1,  1, 1, 1);
        vertices.push(0, 1, 0,  1, 1, 1,  1, 1, 0);
        // Bottom face
        vertices.push(0, 0, 0,  1, 0, 1,  1, 0, 0);
        vertices.push(0, 0, 0,  0, 0, 1,  1, 0, 1);
        // Left face
        vertices.push(0, 0, 0,  0, 1, 0,  0, 1, 1);
        vertices.push(0, 0, 0,  0, 1, 1,  0, 0, 1);
        // Right face
        vertices.push(1, 0, 0,  1, 1, 1,  1, 1, 0);
        vertices.push(1, 0, 0,  1, 0, 1,  1, 1, 1);
    
        drawTriangle3D(vertices);
    }


    renderfaster() {
        var rgba = this.color;

        //gl.uniform1i(u_whichTexture, -2);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to uModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
                initTriangle3D();
        }

        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    renderTexturedFaceOnly() {
        let uv = [
            0, 0,   1, 1,   1, 0,
            0, 0,   0, 1,   1, 1
        ];
    
        let positions = [
            0, 0, 0,   1, 1, 0,   1, 0, 0,
            0, 0, 0,   0, 1, 0,   1, 1, 0
        ];
    
        let vertices = [];
        for (let i = 0; i < 6; i++) {
            vertices.push(
                positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                uv[i * 2], uv[i * 2 + 1]
            );
        }
    
        const FSIZE = Float32Array.BYTES_PER_ELEMENT;
        const vertexData = new Float32Array(vertices);
    
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);
    
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
        gl.enableVertexAttribArray(a_UV);
    
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    
}
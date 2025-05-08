class Cube{
    constructor(){
        this.type = 'cube';
//        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
//        this.size = 5.0;
//        this.segments = g_circleSegments;
        this.matrix = new Matrix4();
        this.useTexture = false;
        this.textureNum = 10; // Default to not using texture

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

        // Determine if this cube should use a texture
        if (this.useTexture) {
                gl.uniform1i(u_UseTexture, this.textureNum);
        } else {
                gl.uniform1i(u_UseTexture, 0); // Don't use texture
        }

        // Front face
        drawTriangle3DUV([0, 0, 0,  1, 1, 0,  1, 0, 0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0, 0, 0,  0, 1, 0,  1, 1, 0], [0,0, 0,1, 1,1]);
      
        // Back face
        drawTriangle3DUV([0, 0, 1,  1, 0, 1,  1, 1, 1], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0, 0, 1,  1, 1, 1,  0, 1, 1], [1,0, 0,1, 0,0]);      

        // Slightly darker color for shaded faces
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top face
        drawTriangle3DUV([0, 1, 0,  0, 1, 1,  1, 1, 1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0, 1, 0,  1, 1, 1,  1, 1, 0], [0,0, 1,1, 1,0]);
      
        // Bottom face
        drawTriangle3DUV([0, 0, 0,  1, 0, 1,  1, 0, 0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0, 0, 0,  0, 0, 1,  1, 0, 1], [0,0, 0,1, 1,1]);
      
        // Left face
        drawTriangle3DUV([0, 0, 0,  0, 1, 0,  0, 1, 1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0, 0, 0,  0, 1, 1,  0, 0, 1], [0,0, 1,1, 0,1]);
      
        // Right face
        drawTriangle3DUV([1, 0, 0,  1, 1, 1,  1, 1, 0], [1,0, 1,1, 0,1]);
        drawTriangle3DUV([1, 0, 0,  1, 0, 1,  1, 1, 1], [1,0, 0,1 , 1,1]);
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
}

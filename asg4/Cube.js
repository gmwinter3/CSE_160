let _cubeVBO = null;

class Cube{

    /*
    static initVertexBuffer() {
        if (_cubeVBO) return; // already initialized

        // Build a temporary cube instance to generate cubeVertsUV32
        const temp = new Cube();
        const data = temp.cubeVertsUV32;

        // Create, bind, and upload the static VBO
        _cubeVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, _cubeVBO);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        const FSIZE = data.BYTES_PER_ELEMENT;
        // Position attribute (3 floats)
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);
        // UV attribute (2 floats)
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
        gl.enableVertexAttribArray(a_UV);
    }
    */

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

            this.cubeUVs = [
                // Front
                0,0,  1,1,  1,0,
                0,0,  0,1,  1,1,
                // Back
                1,0,  0,0,  0,1,
                1,0,  0,1,  0,0,
                // Top
                0,0,  0,1,  1,1,
                0,0,  1,1,  1,0,
                // Bottom
                0,0,  1,1,  1,0,
                0,0,  0,1,  1,1,
                // Left
                0,0,  0,1,  1,1,
                0,0,  1,1,  0,1,
                // Right
                1,0,  1,1,  0,1,
                1,0,  0,1,  1,1
              ];

              const verts = this.cubeVerts, uvs = this.cubeUVs;
              const interleaved = new Float32Array(36 * 5);
              for (let i = 0; i < 36; i++) {
                interleaved[i*5 + 0] = verts[i*3 + 0];
                interleaved[i*5 + 1] = verts[i*3 + 1];
                interleaved[i*5 + 2] = verts[i*3 + 2];
                interleaved[i*5 + 3] = uvs[i*2  + 0];
                interleaved[i*5 + 4] = uvs[i*2  + 1];
              }
              this.cubeVertsUV32 = interleaved;

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
        drawTriangle3DUVNormal(
            [0, 0, 0,  1, 1, 0,  1, 0, 0], 
            [0,0, 1,1, 1,0],
            [0,0,-1, 0,0,-1, 0,0,-1]);

        drawTriangle3DUVNormal([0, 0, 0,  0, 1, 0,  1, 1, 0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);
      
        // Back face
        //gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3DUVNormal([0, 0, 1,  1, 0, 1,  1, 1, 1], [1,0, 0,0, 0,1], [0,0,1, 0,0,1, 0,0,1]);
        drawTriangle3DUVNormal([0, 0, 1,  1, 1, 1,  0, 1, 1], [1,0, 0,1, 0,0], [0,0,1, 0,0,1, 0,0,1]);      

        // Slightly darker color for shaded faces
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top face
        //gl.uniform4f(u_FragColor, rgba[0]*1.1, rgba[1]*1.1, rgba[2]*1.1, rgba[3]);
        drawTriangle3DUVNormal([0, 1, 0,  0, 1, 1,  1, 1, 1], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([0, 1, 0,  1, 1, 1,  1, 1, 0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);
      
        // Bottom face
        //gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3DUVNormal([0, 0, 0,  1, 0, 1,  1, 0, 0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
        drawTriangle3DUVNormal([0, 0, 0,  0, 0, 1,  1, 0, 1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
      
        // Left face
        //gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
        drawTriangle3DUVNormal([0, 0, 0,  0, 1, 0,  0, 1, 1], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal([0, 0, 0,  0, 1, 1,  0, 0, 1], [0,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
      
        // Right face
        //gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
        drawTriangle3DUVNormal([1, 0, 0,  1, 1, 1,  1, 1, 0], [1,0, 1,1, 0,1], [1,0,0, 1,0,0, 1,0,0]);
        drawTriangle3DUVNormal([1, 0, 0,  1, 0, 1,  1, 1, 1], [1,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
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


    /*
    renderfaster() {
        // One-time VBO upload & attrib setup
        Cube.initVertexBuffer();
        // Bind before drawing (attribute state already points at _cubeVBO)
        gl.bindBuffer(gl.ARRAY_BUFFER, _cubeVBO);

        // Pass uniforms
        gl.uniform1i(u_UseTexture, this.textureNum);
        gl.uniform4f(
            u_FragColor,
            this.color[0], this.color[1],
            this.color[2], this.color[3]
        );
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Single draw call for the whole cube
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
    */
}
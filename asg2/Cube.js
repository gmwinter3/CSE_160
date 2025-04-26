class Cube{
    constructor(){
        this.type = 'cube';
//        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
//        this.size = 5.0;
//        this.segments = g_circleSegments;
        this.matrix = new Matrix4();
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
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

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
}
class Sphere {
    constructor(segments = 5) {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = segments; // number of subdivisions for the sphere
    }

    render() {
        const rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let latBands = this.segments;
        let longBands = this.segments;
        let radius = 0.5;

        for (let lat = 0; lat < latBands; ++lat) {
            let theta1 = lat * Math.PI / latBands;
            let theta2 = (lat + 1) * Math.PI / latBands;

            for (let lon = 0; lon < longBands; ++lon) {
                let phi1 = lon * 2 * Math.PI / longBands;
                let phi2 = (lon + 1) * 2 * Math.PI / longBands;

                // Points of the first triangle
                let x1 = radius * Math.sin(theta1) * Math.cos(phi1);
                let y1 = radius * Math.cos(theta1);
                let z1 = radius * Math.sin(theta1) * Math.sin(phi1);

                let x2 = radius * Math.sin(theta2) * Math.cos(phi1);
                let y2 = radius * Math.cos(theta2);
                let z2 = radius * Math.sin(theta2) * Math.sin(phi1);

                let x3 = radius * Math.sin(theta2) * Math.cos(phi2);
                let y3 = radius * Math.cos(theta2);
                let z3 = radius * Math.sin(theta2) * Math.sin(phi2);

                // Points of the second triangle
                let x4 = radius * Math.sin(theta1) * Math.cos(phi2);
                let y4 = radius * Math.cos(theta1);
                let z4 = radius * Math.sin(theta1) * Math.sin(phi2);

                drawTriangle3D([x1, y1, z1, x2, y2, z2, x3, y3, z3]);
                drawTriangle3D([x1, y1, z1, x3, y3, z3, x4, y4, z4]);
            }
        }
    }
}
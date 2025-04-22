#version 300 es

precision mediump float;precision mediump int;

in vec2 a_position;

in vec2 a_uv;
out vec2 v_uv;

in vec2 a_screenuv;
out vec2 v_screenuv;

uniform mat4 u_matrix;
uniform mat4 u_transform;
uniform int u_outline_radius;
uniform vec2 u_size;
uniform vec2 u_graphic_resolution;

vec2 pixelSize = vec2(1.0, 1.0);

void main() {
    vec2 window = u_size/u_graphic_resolution;

    vec2 computed_scale = (u_size + pixelSize*2.*float(u_outline_radius))/u_size;
    mat2 scale_matrix = mat2(computed_scale.x, 0., 0., computed_scale.y);
    vec2 translation = vec2(pixelSize*float(u_outline_radius));

    // Scale the vertex position outward by u_outline_radius pixels
    vec2 scaledPosition = scale_matrix * a_position - translation;
    vec2 vertexOffsetUV = ((a_uv-(window/2.) * computed_scale) + window/2.)/u_size;

    // Set the vertex position using the ortho & transform matrix
    //    gl_Position = u_matrix * u_transform * vec4(scaledPosition, 0.0, 1.0);
    gl_Position = u_matrix * u_transform * vec4(a_position, 0.0, 1.0);

    // Scale UVs outward from center
    //    v_uv = (a_uv+vec2(0.5, 0.5))*computed_scale - vec2(0.5, 0.5);//- (vertexOffsetUV*computed_scale);
    v_uv = a_uv;

    // Pass through the screen UV coord
    v_screenuv = a_screenuv;
}
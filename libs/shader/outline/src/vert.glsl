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

vec2 pixelSize = vec2(1.0, 1.0);

void main() {
    // Calculate the direction to expand the vertex (outward from center)
    // a_position is in normalized device coordinates (-1 to 1)
    vec2 direction = normalize(a_position);

    vec2 computed_scale = (u_size + 2.*float(u_outline_radius))/u_size;

    // Scale the vertex position outward by u_outline_radius pixels
    vec2 scaledPosition = a_position * (computed_scale) - (pixelSize*float(u_outline_radius));

    // Set the vertex position using the ortho & transform matrix
    gl_Position = u_matrix * u_transform * vec4(scaledPosition, 0.0, 1.0);
    gl_Position = u_matrix * u_transform * vec4(a_position, 0.0, 1.0);

    // Scale UVs outward from center
    v_uv = a_uv * computed_scale - (pixelSize*float(u_outline_radius)/u_size);
    v_uv = a_uv;

    // Pass through the screen UV coord
    v_screenuv = a_screenuv;
}
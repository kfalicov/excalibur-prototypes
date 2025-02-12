#version 300 es
in vec2 a_position;

in vec2 a_uv;
out vec2 v_uv;

in vec2 a_screenuv;
out vec2 v_screenuv;

uniform mat4 u_matrix;
uniform mat4 u_transform;

void main() {
    // Set the vertex position using the ortho & transform matrix
    gl_Position = u_matrix * u_transform * vec4(a_position, 0.0, 1.0);

    // Pass through the UV coord to the fragment shader
    v_uv = a_uv;
    v_screenuv = a_screenuv;
}
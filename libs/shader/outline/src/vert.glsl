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

    // Get the size of a pixel in NDC space
    // This is derived from the inverse of the projection matrix (u_matrix)
    // We're extracting the scale factors from the matrix
    //    vec2 pixelSize = vec2(
    //    2.0 / (u_matrix[0][0] * u_transform[0][0]),
    //    2.0 / (u_matrix[1][1] * u_transform[1][1])
    //    );
    //    vec2 pixelSize = vec2(10.0, 1.0);
    vec2 computed_scale = (u_size + 2.*float(u_outline_radius))/u_size;

    // Scale the vertex position outward by u_outline_radius pixels
    vec2 scaledPosition = a_position * (computed_scale) - (pixelSize*float(u_outline_radius));

    // Set the vertex position using the ortho & transform matrix
    gl_Position = u_matrix * u_transform * vec4(scaledPosition, 0.0, 1.0);

    //    // Calculate how much the UVs need to be adjusted
    //    // UVs go from 0 to 1, so we need to scale them inversely to the position scaling
    //    vec2 uvDirection = a_uv - vec2(0.5, 0.5);// Direction from center in UV space
    //    float uvLength = length(uvDirection);
    //
    //    if (uvLength > 0.0) {
    //        uvDirection = normalize(uvDirection);
    //    } else {
    //        uvDirection = vec2(0.0, 0.0);
    //    }
    //
    //    // Calculate UV adjustment based on the same pixel size we used for position
    //    // This ensures proportional scaling without needing texture dimensions
    //    float uvAdjustmentFactor = float(u_outline_radius) /
    //    (0.5 * length(vec2(u_matrix[0][0] * u_transform[0][0],
    //    u_matrix[1][1] * u_transform[1][1])));

    // Scale UVs outward from center
    v_uv = a_uv * computed_scale;// - (pixelSize*float(u_outline_radius)/u_size);// - uvDirection * uvAdjustmentFactor;

    // Pass through the screen UV coord
    v_screenuv = a_screenuv;
}
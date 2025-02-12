#version 300 es

precision mediump float;

uniform sampler2D u_graphic;
uniform vec2 u_resolution;
uniform vec2 u_graphic_resolution;

in vec2 v_texcoord;
in vec2 v_uv;
in vec2 v_screenuv;

out vec4 color;

// Inigo Quilez pixel art filter https://jorenjoestar.github.io/post/pixel_art_filtering/
vec2 uv_iq(in vec2 uv, in vec2 texture_size) {
    vec2 pixel = uv * texture_size;

    vec2 seam=floor(pixel+.5);
    vec2 dudv=fwidth(pixel);
    pixel=seam+clamp((pixel-seam)/dudv, -.5, .5);

    return pixel/texture_size;
}

void main() {

    vec2 onePixel = vec2(2.0, 2.0)/vec2(textureSize(u_graphic, 0));
    // Use the new UV from uv_iq to sample your pixel art texture
    vec2 newUv = v_uv.xy;

    vec4 sprite = texture(u_graphic, newUv);
    
    float up = texture(u_graphic, v_uv+vec2(0., onePixel.y)).w;
    float down = texture(u_graphic, v_uv-vec2(0., onePixel.y)).w;
    float left = texture(u_graphic, v_uv-vec2(onePixel.x, 0.)).w;
    float right = texture(u_graphic, v_uv+vec2(onePixel.x, 0.)).w;

    if (up+down+left+right!=0. && sprite.a==0.) color=vec4(0., 0., 0., 1.);
    else color=sprite;// Example output color
}
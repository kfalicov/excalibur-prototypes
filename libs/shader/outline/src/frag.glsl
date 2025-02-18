#version 300 es

precision mediump float;

uniform sampler2D u_graphic;
uniform vec2 u_resolution;
uniform vec2 u_graphic_resolution;

in vec2 v_texcoord;
in vec2 v_uv;
in vec2 v_screenuv;

out vec4 color;

float yboxblur (int width, vec2 pixelSize){
    // Vertical box blur.
    float sum = 0.;
    int samples = 2 * width + 1;
    for (int y = 0; y < samples; y++)
    {
        vec2 offset = vec2(0., y - width);
        sum += texture(u_graphic, v_uv + offset * pixelSize.xy * vec2(0., 1.)).w;
    }
    return sum;
}

float xboxblur (int width, vec2 pixelSize){
    // Horizontal box blur.
    float sum = 0.;
    int samples = 2 * width + 1;
    for (int x = 0; x < samples; x++)
    {
        vec2 offset = vec2(x - width, 0.);
        sum += texture(u_graphic, v_uv + offset * pixelSize.xy * vec2(1., 0.)).w;
    }
    return sum;
}

void main() {

    vec2 onePixel = vec2(1.0, 1.0)/vec2(textureSize(u_graphic, 0));
    // Use the new UV from uv_iq to sample your pixel art texture
    vec2 newUv = v_uv.xy;

    vec4 sprite = texture(u_graphic, newUv);

    float horiz = xboxblur(2, onePixel);
    float vert = yboxblur(2, onePixel);


    if ((horiz>0. || vert > 1.) && sprite.a == 0.) color=vec4(0., 0., 0., 1.);
    else color=sprite;// Example output color
}
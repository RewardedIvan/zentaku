export function RGBtoHSV(r: number, g: number, b: number) {
	var max = Math.max(r, g, b),
		min = Math.min(r, g, b),
		d = max - min,
		h,
		s = max === 0 ? 0 : d / max,
		v = max / 255;

	switch (max) {
		case min:
			h = 0;
			break;
		case r:
			h = g - b + d * (g < b ? 6 : 0);
			h /= 6 * d;
			break;
		case g:
			h = b - r + d * 2;
			h /= 6 * d;
			break;
		case b:
			h = r - g + d * 4;
			h /= 6 * d;
			break;
	}

	return {
		h: h ?? 0,
		s,
		v,
	};
}

export function HSVtoRGB(h: number, s: number, v: number) {
	var r = 0,
		g = 0,
		b = 0,
		i,
		f,
		p,
		q,
		t;
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0:
			(r = v), (g = t), (b = p);
			break;
		case 1:
			(r = q), (g = v), (b = p);
			break;
		case 2:
			(r = p), (g = v), (b = t);
			break;
		case 3:
			(r = p), (g = q), (b = v);
			break;
		case 4:
			(r = t), (g = p), (b = v);
			break;
		case 5:
			(r = v), (g = p), (b = q);
			break;
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
}

export function extractArgb(argb: number) {
	return {
		a: (argb >> 24) & 0xff,
		r: (argb >> 16) & 0xff,
		g: (argb >> 8) & 0xff,
		b: argb & 0xff,
	};
}

export function getComponentOffset(component: "r" | "g" | "b" | "a") {
	switch (component) {
		case "r":
			return 16;
		case "g":
			return 8;
		case "b":
			return 0;
		case "a":
			return 24;
		default:
			return 0;
	}
}

export type RGBAComponent = "r" | "g" | "b" | "a";
export function withComponentValue(argb: number, component: RGBAComponent, value: number) {
	const compOff = getComponentOffset(component);
	// there is prolly a simpler way to do this
	return (argb & (0xffffffff ^ (0xff << compOff))) | (value << compOff);
}

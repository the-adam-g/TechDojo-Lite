(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.TDEngineeringMaths = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const groups = {
        '1': 'Engineering mathematics',
        '2.1': 'Statics and materials',
        '2.2': 'Beams',
        '2.3': 'Dynamics',
        '3.1': 'Electrical principles',
        '3.2': 'Analogue electronics'
    };
    const radians = degrees => degrees * Math.PI / 180;
    const degrees = angle => angle * 180 / Math.PI;
    const {PI, sqrt, sin, cos, atan, hypot, log10} = Math;
    const gravity = 9.81;
    const display = value => Number(value.toPrecision(3)).toString();

    function part(label, unit, value, method) {
        const tolerance = value === 0 ? 0 : 0.5 * 10 ** (Math.floor(log10(Math.abs(value))) - 2);
        return {label, unit, value, tolerance, work: method + ' = ' + display(value) + (unit ? ' ' + unit : '') + '.'};
    }

    const families = {
        prefixes: ['1.1', 'Metric prefixes', r => {
            const x = r(11, 980), y = r(21, 860);
            return [`A shim is ${x} μm thick and a timing capacitor is rated at ${y} pF. Convert to metres and farads.`,
                part('Thickness', 'm', x * 1e-6, `${x} × 10⁻⁶`),
                part('Capacitance', 'F', y * 1e-12, `${y} × 10⁻¹²`)];
        }],
        notation: ['1.1', 'Engineering notation', r => {
            const a = r(100, 999), shift = r(0, 2), exponents = [-12, -9, -6, -3, 3, 6, 9];
            const exponent = exponents[r(0, exponents.length - 1)];
            const coefficient = a / 10 ** shift;
            const scientificExponent = exponent + 2 - shift;
            return [`A reading is ${a / 100} × 10^${scientificExponent} s. Express it in engineering notation using a coefficient from 1 to below 1000.`,
                part('Coefficient', '', coefficient, `(${a / 100} × 10^${scientificExponent}) ÷ 10^${exponent}`),
                part('Exponent of 10', '', exponent, 'The multiple of three that gives a coefficient from 1 to below 1000')];
        }],
        plates: ['1.2', 'Areas and perimeters', r => {
            const w = r(80, 240), h = r(55, 75), d = r(15, 46);
            return [`A ${w} mm by ${h} mm panel has a circular hole of diameter ${d} mm. Find the remaining face area and the total inner and outer edge length.`,
                part('Face area', 'mm²', w * h - PI * (d / 2) ** 2, `${w} × ${h} − π × (${d}/2)²`),
                part('Total edge length', 'mm', 2 * (w + h) + PI * d, `2 × (${w} + ${h}) + π × ${d}`)];
        }],
        solids: ['1.2', 'Volumes, surface area and mass', r => {
            const radius = r(20, 95), height = r(25, 140), density = r(25, 85) * 100;
            const shape = r(0, 2), d = radius / 1000, h = height / 1000;
            const volume = [PI * d * d * h, PI * d * d * h / 3, 4 * PI * d ** 3 / 3][shape];
            const surface = [2 * PI * d * (d + h), PI * d * (d + hypot(d, h)), 4 * PI * d * d][shape];
            const shapeText = ['closed cylinder', 'closed right cone', 'sphere'][shape];
            const volumes = ['πr²h', 'πr²h ÷ 3', '4πr³ ÷ 3'];
            const areas = ['2πr(r + h)', 'πr(r + √(r² + h²))', '4πr²'];
            const dimensions = shape === 2 ? `r = ${d} m` : `r = ${d} m, h = ${h} m`;
            return [`A solid ${shapeText} has radius ${radius} mm${shape === 2 ? '' : ` and vertical height ${height} mm`}. Its density is ${density} kg/m³. Find volume, outside surface area and mass.`,
                part('Volume', 'm³', volume, `${volumes[shape]} with ${dimensions}`),
                part('Outside surface area', 'm²', surface, `${areas[shape]} with ${dimensions}`),
                part('Mass', 'kg', volume * density, `${density} × the unrounded volume in m³`)];
        }],
        triangle: ['1.2', 'Triangle area', r => {
            const a = r(5, 38), b = r(6, 27), angle = r(26, 137);
            return [`Two sides of a triangular plate measure ${a} cm and ${b} cm. The angle between them is ${angle}°. Find the face area.`,
                part('Area', 'cm²', a * b * sin(radians(angle)) / 2, `½ × ${a} × ${b} × sin(${angle}°)`)];
        }],
        line: ['1.3', 'Gradient and intercept', r => {
            const x = r(1, 8), span = r(2, 13), slope = r(1, 35) / 5 * (r(0, 1) ? 1 : -1), intercept = r(-22, 22);
            const y = Math.round((slope * x + intercept) * 10) / 10;
            const y2 = Math.round((slope * (x + span) + intercept) * 10) / 10;
            return [`A calibration line passes through (${x}, ${y}) and (${x + span}, ${y2}). Find the gradient and y-intercept.`,
                part('Gradient', '', slope, `(${y2} − (${y})) ÷ ${span}`),
                part('Vertical intercept', '', intercept, `${y} − gradient × ${x}`)];
        }],
        algebra: ['1.3', 'Simultaneous equations', r => {
            const x = r(2, 29), y = r(3, 37), a = r(2, 7), b = a + r(1, 5);
            const s = x + y, t = a * x + b * y;
            return [`Solve x + y = ${s} and ${a}x + ${b}y = ${t}.`,
                part('x', '', x, `(${b} × ${s} − ${t}) ÷ (${b} − ${a})`),
                part('y', '', y, `${s} − x`)];
        }],
        quadratics: ['1.3', 'Quadratic roots', r => {
            const a = r(1, 13), b = a + r(1, 11), sum = a + b, product = a * b;
            return [`Solve x² − ${sum}x + ${product} = 0. Give the roots in ascending order.`,
                part('Smaller root', '', a, `(${sum} − √(${sum}² − 4 × ${product})) ÷ 2`),
                part('Larger root', '', b, `(${sum} + √(${sum}² − 4 × ${product})) ÷ 2`)];
        }],
        exponential: ['1.3', 'Exponential growth and decay', r => {
            const initial = r(28, 95), factor = r(0, 1) ? r(80, 96) / 100 : r(104, 126) / 100;
            const time = r(3, 15), target = factor < 1 ? r(7, 24) : r(100, 185);
            return [`A signal follows S = ${initial} × ${factor}ᵗ, where t is in seconds. Find S after ${time} s and the time when S = ${target}. Use t = log₁₀(S/${initial}) ÷ log₁₀(${factor}).`,
                part('Signal level', '', initial * factor ** time, `${initial} × ${factor}^${time}`),
                part('Time to target', 's', log10(target / initial) / log10(factor), `log₁₀(${target}/${initial}) ÷ log₁₀(${factor})`)];
        }],
        trigonometry: ['1.4', 'Right triangles and radians', r => {
            const rise = r(6, 49), run = r(15, 86), angle = atan(rise / run);
            return [`A bracket rises ${rise} cm over a horizontal run of ${run} cm. Find the diagonal length and its angle above the horizontal, in degrees and radians.`,
                part('Diagonal', 'cm', hypot(rise, run), `√(${rise}² + ${run}²)`),
                part('Angle in degrees', '°', degrees(angle), `tan⁻¹(${rise}/${run}) in degrees`),
                part('Angle in radians', 'rad', angle, 'Unrounded angle in degrees × π ÷ 180')];
        }],
        cosine: ['1.4', 'Sine and cosine rules', r => {
            const a = r(15, 35), b = r(12, 21), angle = r(92, 135), ar = radians(angle);
            const c = sqrt(a*a + b*b - 2*a*b*cos(ar));
            const bAngle = degrees(Math.asin(b * sin(ar) / c));
            return [`Bars of lengths ${a} m and ${b} m meet at ${angle}°. Their ends form a triangle. Find the third side and the angle opposite the ${b} m bar (the second bar).`,
                part('Third side', 'm', c, `√(${a}² + ${b}² − 2 × ${a} × ${b} × cos(${angle}°))`),
                part('Angle opposite second bar', '°', bAngle, `sin⁻¹(${b} × sin(${angle}°) ÷ unrounded third side)`)];
        }],
        waves: ['1.4', 'Amplitude and period', r => {
            const a = r(2, 24) / 2, b = r(2, 19);
            return [`A vibration is described by y = ${a} cos(${b}x), with x in radians. Find its amplitude and smallest positive period.`,
                part('Amplitude', '', a, 'The magnitude of the cosine coefficient'),
                part('Period', 'rad', 2 * PI / b, `2π ÷ ${b}`)];
        }],
        forceScale: ['2.1.1', 'Force diagram scales', r => {
            const scale = r(4, 23) * 5, length = r(15, 89) / 10, sign = r(0, 1) ? 1 : -1;
            return [`An arrow ${length} cm long points ${sign === 1 ? 'right' : 'left'}. The force diagram uses 1 cm to ${scale} N. Find the signed force, taking right as positive.`,
                part('Signed force', 'N', sign * scale * length, `${sign === -1 ? '−' : ''}${scale} × ${length}`)];
        }],
        moments: ['2.1.2', 'Moments and inclined forces', r => {
            const f = r(18, 135), a = r(24, 78), l = r(13, 85) / 100;
            const arm = l * sin(radians(a));
            return [`A ${f} N force acts at ${a}° to a lever, ${l} m from the pivot. Find the perpendicular moment arm and the moment magnitude.`,
                part('Moment arm', 'm', arm, `${l} × sin(${a}°)`),
                part('Moment', 'N m', f * arm, `${f} × the unrounded moment arm`)];
        }],
        concurrent: ['2.1.3', 'Force components and resultants', r => {
            const f = r(80, 385), a = r(21, 74), w = r(30, 255);
            const x = f * cos(radians(a)), y = f * sin(radians(a)) - w;
            return [`A node is pulled by ${f} N at ${a}° above the rightward horizontal and ${w} N straight down. Find its resultant. Right and up are positive.`,
                part('Horizontal component', 'N', x, `${f} × cos(${a}°)`),
                part('Vertical component', 'N', y, `${f} × sin(${a}°) − ${w}`),
                part('Resultant magnitude', 'N', hypot(x, y), '√(horizontal component² + vertical component²) using unrounded values')];
        }],
        nonconcurrent: ['2.1.4', 'Lines of action', r => {
            const a = r(3, 15) / 10, b = a + r(4, 20) / 10, f = r(9, 50) * 10, g = r(7, 32) * 10;
            return [`Downward parallel forces of ${f} N and ${g} N act ${a} m and ${display(b)} m to the right of O respectively. Find their equivalent single force.`,
                part('Downward force', 'N', f + g, `${f} + ${g}`),
                part('Distance right of O', 'm', (f*a + g*b) / (f+g), `(${f} × ${a} + ${g} × ${display(b)}) ÷ (${f} + ${g})`)];
        }],
        tensile: ['2.1.5', 'Tensile stress and strain', r => {
            const f = r(85, 350) * 100, d = r(10, 18), l = r(25, 65) * 10, ext = r(20, 75) / 100;
            const stress = f / (PI * (d / 2) ** 2), strain = ext / l;
            return [`A round rod of diameter ${d} mm and gauge length ${l} mm extends ${ext} mm under a tensile load of ${f} N. Assume linear elastic behaviour.`,
                part('Stress', 'MPa', stress, `${f} ÷ [π × (${d}/2)²] (N/mm² is MPa)`),
                part('Strain', '', strain, `${ext} ÷ ${l}`),
                part('Young’s modulus', 'GPa', stress / strain / 1000, 'Unrounded stress in MPa ÷ unrounded strain ÷ 1000')];
        }],
        shear: ['2.1.6', 'Single and double shear', r => {
            const d = r(6, 19), n = r(1, 2), load = r(34, 240) * 100;
            const area = n * PI * (d / 2) ** 2;
            return [`A pin of diameter ${d} mm transmits ${load} N in ${n === 1 ? 'single' : 'symmetric double'} shear. Find its total resisting area and average shear stress.`,
                part('Resisting area', 'mm²', area, `${n} × π × (${d}/2)²`),
                part('Shear stress', 'MPa', load / area, `${load} ÷ unrounded resisting area (N/mm² is MPa)`)];
        }],
        shearStrain: ['2.1.6', 'Shear strain and modulus', r => {
            const x = r(12, 82) / 1000, h = r(15, 46), f = r(85, 275) * 100, area = r(115, 225);
            const strain = x / h;
            return [`A face of a ${h} mm thick block moves sideways ${x} mm under a shear force of ${f} N over ${area} mm². Use the small-angle approximation.`,
                part('Shear strain', '', strain, `${x} ÷ ${h}`),
                part('Shear modulus', 'GPa', f / area / strain / 1000, `(${f} ÷ ${area}) ÷ unrounded strain ÷ 1000`)];
        }],
        elastic: ['2.1.7', 'Elastic stress–strain gradients', r => {
            const e = r(45, 220), x = r(2, 7), y = x + r(2, 7), z = r(1, 8);
            const strain = n => (n / 10000).toFixed(4);
            const stress = n => Number((e * n / 10).toFixed(1));
            return [`A linear elastic stress–strain graph passes through (${strain(x)}, ${stress(x)} MPa) and (${strain(y)}, ${stress(y)} MPa), with strain first. Find the modulus and stress at strain ${strain(z)}.`,
                part('Young’s modulus', 'GPa', e, `(${stress(y)} − ${stress(x)}) ÷ (${strain(y)} − ${strain(x)}) ÷ 1000`),
                part('Stress', 'MPa', stress(z), `Young’s modulus in GPa × 1000 × ${strain(z)}`)];
        }],
        supports: ['2.2.1', 'Pin and roller reactions', r => {
            const span = r(5, 12), x = r(1, span - 1), f = r(20, 125) * 20;
            const right = f*x/span;
            return [`A beam of span ${span} m is pinned at A and supported by a roller at B. A vertical downward load of ${f} N acts ${x} m from A. Find both upward support reactions.`,
                part('Reaction at A', 'N', f - right, `${f} − the unrounded reaction at B`),
                part('Reaction at B', 'N', right, `${f} × ${x} ÷ ${span} from moments about A`)];
        }],
        distributed: ['2.2.2', 'Equivalent distributed loads', r => {
            const start = r(1, 30) / 10, length = r(13, 36) / 10, load = r(14, 72) * 25;
            return [`A downward UDL of ${load} N/m starts ${start} m from A and acts along ${length} m of the beam. Find the equivalent point load and its distance from A.`,
                part('Equivalent force', 'N', load * length, `${load} × ${length}`),
                part('Distance from A', 'm', start + length / 2, `${start} + ${length} ÷ 2`)];
        }],
        beam: ['2.2.3', 'Beam with point load and UDL', r => {
            const length = r(7, 12), f = r(23, 85) * 25, x = r(1, 3), start = r(4, length - 2);
            const loaded = r(2, length - start), w = r(14, 48) * 25;
            const right = (f * x + w * loaded * (start + loaded / 2)) / length;
            return [`A simply supported beam of span ${length} m has a downward ${f} N load ${x} m from A and a downward ${w} N/m UDL starting ${start} m from A over ${loaded} m. Find the upward reactions.`,
                part('Reaction at B', 'N', right, `[${f} × ${x} + ${w} × ${loaded} × (${start} + ${loaded}/2)] ÷ ${length}`),
                part('Reaction at A', 'N', f + w * loaded - right, `${f} + ${w} × ${loaded} − unrounded reaction at B`)];
        }],
        angledBeam: ['2.2.3', 'Beam with angled point load', r => {
            const length = r(5, 12), x = r(1, length - 1), angle = r(20, 75), f = r(15, 80) * 25;
            const vertical = f * sin(radians(angle)), rb = vertical * x / length;
            return [`A beam of span ${length} m is pinned at A and has a roller at B. A force of ${f} N at ${angle}° below the rightward horizontal acts ${x} m from A. Right and up are positive.`,
                part('Horizontal reaction at A', 'N', -f * cos(radians(angle)), `−${f} × cos(${angle}°)`),
                part('Vertical reaction at B', 'N', rb, `${f} × sin(${angle}°) × ${x} ÷ ${length}`),
                part('Vertical reaction at A', 'N', vertical - rb, `${f} × sin(${angle}°) − unrounded reaction at B`)];
        }],
        bending: ['2.2.4', 'Bending moment diagram ordinates', r => {
            const l = r(8, 14), x = r(2, 4), y = r(x + 1, l - 1), f = r(22, 65) * 20, g = r(15, 54) * 25;
            const rb = (f*x + g*y) / l, ra = f + g - rb;
            return [`A simply supported ${l} m beam carries downward point loads of ${f} N at ${x} m and ${g} N at ${y} m from A. Find the sagging moment ordinates under both loads.`,
                part('Moment under first load', 'N m', ra * x, `Rᴬ × ${x}, where Rᴬ = ${f} + ${g} − (${f} × ${x} + ${g} × ${y}) ÷ ${l}`),
                part('Moment under second load', 'N m', rb * (l - y), `Rᴮ × (${l} − ${y}), where Rᴮ = (${f} × ${x} + ${g} × ${y}) ÷ ${l}`)];
        }],
        projectile: ['2.3.1', 'Horizontal projectiles', r => {
            const h = r(12, 87) / 10, u = r(34, 165) / 10;
            const t = sqrt(2 * h / gravity);
            return [`A part leaves a horizontal conveyor at ${u} m/s and falls ${h} m. Ignore air resistance and use g = 9.81 m/s².`,
                part('Flight time', 's', t, `√(2 × ${h} ÷ 9.81)`),
                part('Horizontal distance', 'm', u * t, `${u} × the unrounded flight time`)];
        }],
        pulley: ['2.3.1', 'Single fixed pulleys', r => {
            const light = r(3, 18), heavy = light + r(2, 15);
            const a = gravity * (heavy - light) / (heavy + light);
            return [`Masses of ${heavy} kg and ${light} kg hang on either side of an ideal fixed pulley on a light inextensible cord. Use g = 9.81 m/s².`,
                part('Acceleration magnitude', 'm/s²', a, `(${heavy} − ${light}) × 9.81 ÷ (${heavy} + ${light})`),
                part('Tension', 'N', light * (gravity + a), `${light} × (9.81 + unrounded acceleration)`)];
        }],
        graph: ['2.3.2', 'Velocity–time graphs', r => {
            const v = r(9, 35), up = r(2, 9), cruise = r(2, 12), down = r(2, 8);
            return [`On a velocity–time graph a vehicle rises from rest to ${v} m/s in ${up} s, travels at that speed for ${cruise} s, then stops in ${down} s. Each segment is straight.`,
                part('Braking acceleration', 'm/s²', -v / down, `(0 − ${v}) ÷ ${down}`),
                part('Displacement', 'm', v * ((up + down) / 2 + cruise), `Area = ½ × ${v} × (${up} + ${down}) + ${v} × ${cruise}`)];
        }],
        newton: ['2.3.3', 'Newton’s laws', r => {
            const mass = r(32, 85), a = r(5, 33) / 10, sign = r(0, 1) ? 1 : -1;
            return [`A ${mass} kg person stands on scales in a lift accelerating ${sign === 1 ? 'upwards' : 'downwards'} at ${a} m/s². Use g = 9.81 m/s².`,
                part('Weight magnitude', 'N', mass * gravity, `${mass} × 9.81`),
                part('Contact force magnitude', 'N', mass * (gravity + sign * a), `${mass} × (9.81 ${sign === 1 ? '+' : '−'} ${a})`)];
        }],
        suvat: ['2.3.4', 'SUVAT and braking', r => {
            const u = r(21, 42), v = r(1, 18), d = r(38, 121);
            return [`A machine slows uniformly from ${u} m/s to ${v} m/s while travelling ${d} m. Use the initial direction as positive.`,
                part('Signed acceleration', 'm/s²', (v*v - u*u) / (2*d), `(${v}² − ${u}²) ÷ (2 × ${d})`),
                part('Elapsed time', 's', 2*d / (u+v), `2 × ${d} ÷ (${u} + ${v})`)];
        }],
        hoist: ['2.3.5', 'Work, power and efficiency', r => {
            const m = r(28, 89), h = r(13, 68) / 10, t = r(8, 22);
            const work = m * gravity * h, p = work / t, input = Math.ceil(p) + r(30, 220);
            return [`A hoist raises a ${m} kg load by ${h} m in ${t} s, starting and ending at rest. Average input power is ${input} W. Use g = 9.81 m/s².`,
                part('Useful work', 'J', work, `${m} × 9.81 × ${h}`),
                part('Useful power', 'W', p, `Unrounded useful work ÷ ${t}`),
                part('Efficiency', '%', 100 * p / input, `100 × unrounded useful power ÷ ${input}`)];
        }],
        friction: ['2.3.6', 'Static and dynamic friction', r => {
            const m = r(18, 85), k = r(16, 33) / 100, s = k + r(8, 23) / 100;
            const n = m * gravity, f = Math.ceil(s*n) + r(20, 135);
            return [`A ${m} kg crate rests on a level surface. Its static friction coefficient is ${display(s)} and its dynamic coefficient is ${k}. Use g = 9.81 m/s². Find the limiting static friction and acceleration while the crate slides under a horizontal push of ${f} N.`,
                part('Limiting static friction', 'N', s * n, `${display(s)} × ${m} × 9.81`),
                part('Acceleration', 'm/s²', (f - k*n) / m, `(${f} − ${k} × ${m} × 9.81) ÷ ${m}`)];
        }],
        energy: ['2.3.7', 'Energy balances with resistance', r => {
            const m = r(28, 73), h = r(21, 67) / 10, d = r(9, 17), limit = Math.floor(m * gravity * h / d / 2), f = r(11, limit);
            const loss = f * d, ke = m * gravity * h - loss;
            return [`A ${m} kg cart starts from rest and travels ${d} m down a track with a vertical drop of ${h} m. It experiences a constant resistance of ${f} N. Use g = 9.81 m/s².`,
                part('Work against resistance', 'J', loss, `${f} × ${d}`),
                part('Final kinetic energy', 'J', ke, `${m} × 9.81 × ${h} − ${f} × ${d}`),
                part('Final speed', 'm/s', sqrt(2*ke/m), `√(2 × unrounded kinetic energy ÷ ${m})`)];
        }],
        momentum: ['2.3.8', 'Momentum and sticking collisions', r => {
            const m = r(4, 15), n = r(4, 19), u = r(3, 14), v = -r(2, 12);
            const p = m * u + n * v, speed = p / (m+n);
            return [`Two carts of masses ${m} kg and ${n} kg have signed velocities ${u} m/s and ${v} m/s. They collide on a level track and stick together. Assume negligible external impulse.`,
                part('Total initial momentum', 'kg m/s', p, `${m} × ${u} + ${n} × (${v})`),
                part('Common velocity', 'm/s', speed, `Total momentum ÷ (${m} + ${n})`),
                part('Kinetic energy lost', 'J', (m*u*u + n*v*v - (m+n)*speed*speed)/2, `½ × [${m} × ${u}² + ${n} × (${v})² − (${m} + ${n}) × unrounded common velocity²]`)];
        }],
        elasticCollision: ['2.3.8', 'Elastic collisions', r => {
            const m = r(2, 12), n = r(3, 15), u = r(2, 14);
            return [`A ${m} kg cart moving at ${u} m/s collides head-on and elastically with a stationary ${n} kg cart. Use momentum conservation and equal relative speeds of approach and separation. Positive is the initial direction.`,
                part('First cart velocity', 'm/s', (m-n)*u/(m+n), `(${m} − ${n}) × ${u} ÷ (${m} + ${n})`),
                part('Second cart velocity', 'm/s', 2*m*u/(m+n), `2 × ${m} × ${u} ÷ (${m} + ${n})`)];
        }],
        resistivity: ['3.1.1', 'Wire resistivity', r => {
            const l = r(10, 65), d = r(35, 130) / 100, res = r(27, 138) / 100;
            const area = PI * (d / 2000) ** 2;
            return [`A round wire is ${l} m long with diameter ${d} mm and resistance ${res} Ω. Find its cross-sectional area and resistivity.`,
                part('Cross-sectional area', 'm²', area, `π × (${d} ÷ 2000)²`),
                part('Resistivity', 'Ω m', res * area / l, `${res} × unrounded area ÷ ${l}`)];
        }],
        dc: ['3.1.1', 'Combined DC resistors', r => {
            const a = r(6, 38), b = r(9, 55), c = r(12, 76), v = r(5, 35);
            const pair = b*c/(b+c), total = a+pair, i = v/total;
            return [`Across ${v} V DC, a ${a} Ω resistor is in series with a parallel pair consisting of ${b} Ω and ${c} Ω (the second branch). Find the equivalent resistance, supply current and power in the second branch.`,
                part('Equivalent resistance', 'Ω', total, `${a} + 1 ÷ (1/${b} + 1/${c})`),
                part('Supply current', 'A', i, `${v} ÷ unrounded equivalent resistance`),
                part('Second branch power', 'W', (i*pair)**2 / c, `(Unrounded supply current × parallel equivalent resistance)² ÷ ${c}`)];
        }],
        charge: ['3.1.1', 'Charge and electrical energy', r => {
            const v = r(6, 42), i = r(23, 190) / 100, t = r(15, 165);
            return [`A DC sensor circuit draws ${i} A from a ${v} V source for ${t} s. Find the charge passing through it and the energy transferred.`,
                part('Charge', 'C', i*t, `${i} × ${t}`),
                part('Energy', 'J', i*t*v, `${i} × ${t} × ${v}`)];
        }],
        capacitor: ['3.1.2', 'Capacitors and time constants', r => {
            const c = r(11, 82) * 10, v = r(5, 25), rK = r(6, 59);
            return [`A ${c} μF capacitor charged to ${v} V discharges through a ${rK} kΩ resistor. Find the initial charge, stored energy and time constant.`,
                part('Initial charge', 'μC', c*v, `${c} × ${v}`),
                part('Stored energy', 'mJ', c*v*v/2000, `½ × ${c} × 10⁻⁶ × ${v}² × 1000`),
                part('Time constant', 's', rK*c/1000, `(${rK} × 10³) × (${c} × 10⁻⁶)`)];
        }],
        dielectric: ['3.1.2', 'Parallel plates and dielectrics', r => {
            const a = r(32, 155), d = r(12, 85) / 100, e = r(2, 25);
            const air = 8.85*a/(10*d);
            return [`Capacitor plates of overlap area ${a} cm² are separated by ${d} mm. Use ε₀ = 8.85 × 10⁻¹² F/m. Find capacitance with vacuum and with a dielectric of relative permittivity ${e}.`,
                part('Vacuum capacitance', 'pF', air, `8.85 × (${a} × 10⁻⁴) ÷ (${d} × 10⁻³)`),
                part('Capacitance with dielectric', 'pF', e*air, `${e} × unrounded vacuum capacitance`)];
        }],
        kirchhoff: ['3.1.3', 'Kirchhoff with two DC sources', r => {
            const v = r(14, 30), w = r(4, 13), a = r(4, 12), b = r(8, 17), c = r(12, 25);
            // Keep cancellation exact when one branch has zero current.
            const denominator = a*b + a*c + b*c;
            const numerator = v*b*c + w*a*c;
            const x = numerator / denominator;
            return [`Sources at ${v} V and ${w} V relative to ground feed node X through ${a} Ω and ${b} Ω respectively. Node X connects to ground through ${c} Ω. Use Kirchhoff’s laws to find X’s voltage and the current from each source towards X. A negative current means flow towards the source.`,
                part('Voltage at X', 'V', x, `At X, (${v} − X)/${a} + (${w} − X)/${b} = X/${c}; solve for X`),
                part('Current from first source', 'A', (v*denominator - numerator)/(a*denominator), `(${v} − unrounded X) ÷ ${a}`),
                part('Current from second source', 'A', (w*denominator - numerator)/(b*denominator), `(${w} − unrounded X) ÷ ${b}`)];
        }],
        inductance: ['3.1.4', 'Inductance and stored energy', r => {
            const n = r(23, 86)*10, flux = r(32, 192)/1000, i = r(6, 29)/10;
            const inductance = n*flux/(1000*i);
            return [`A coil of ${n} turns has ${flux} mWb of flux linking each turn at a current of ${i} A. Find inductance and the energy stored in the magnetic field.`,
                part('Inductance', 'H', inductance, `${n} × ${flux} × 10⁻³ ÷ ${i}`),
                part('Stored energy', 'J', inductance*i*i/2, `½ × unrounded inductance × ${i}²`)];
        }],
        motor: ['3.1.4', 'Force on a conductor', r => {
            const b = r(14, 78)/100, i = r(16, 62)/10, l = r(8, 35)/100, a = r(20, 80);
            return [`A conductor of active length ${l} m carries ${i} A at ${a}° to a ${b} T field. Find the force magnitude and the force if it is rotated to 90° to the field.`,
                part('Force at given angle', 'N', b*i*l*sin(radians(a)), `${b} × ${i} × ${l} × sin(${a}°)`),
                part('Force at 90°', 'N', b*i*l, `${b} × ${i} × ${l} × sin(90°)`)];
        }],
        ac: ['3.1.5', 'AC waveforms and RMS', r => {
            const peak = r(8, 46), f = r(35, 115), t = r(1, 24), resist = r(6, 65);
            const instantaneous = ((f*t) % 500 === 0) ? 0 : peak*sin(2*PI*f*t/1000);
            return [`An AC source v = ${peak} sin(2π × ${f}t) V feeds a ${resist} Ω resistor, with t in seconds. Find the period, RMS current and signed instantaneous voltage at ${t} ms.`,
                part('Period', 'ms', 1000/f, `1000 ÷ ${f}`),
                part('RMS current', 'A', peak/(sqrt(2)*resist), `${peak} ÷ (√2 × ${resist})`),
                part('Instantaneous voltage', 'V', instantaneous, `${peak} × sin(2π × ${f} × ${t}/1000)`)];
        }],
        resistiveAC: ['3.1.5', 'Purely resistive AC networks', r => {
            const v = r(12, 36), a = r(4, 12), b = r(14, 37), c = r(9, 29);
            const pair = b*c/(b+c), total = a+pair;
            return [`An AC source of ${v} V RMS feeds a ${a} Ω resistor in series with a parallel pair of ${b} Ω and ${c} Ω (second branch). Find the RMS voltage across the pair and the RMS current in the second branch.`,
                part('Voltage across the pair', 'V', v*pair/total, `${v} × Rₚ ÷ (${a} + Rₚ), where Rₚ = 1 ÷ (1/${b} + 1/${c})`),
                part('Second branch current', 'A', v*pair/(total*c), `Unrounded voltage across the pair ÷ ${c}`)];
        }],
        batteries: ['3.1.6', 'Battery life', r => {
            const c = r(12, 42)*100, hi = r(120, 400), lo = r(12, 86), duty = r(15, 64);
            const avg = (duty*hi+(100-duty)*lo)/100;
            return [`A ${c} mAh battery runs a device that draws ${hi} mA for ${duty}% of the time and ${lo} mA otherwise. Estimate average current and ideal battery life.`,
                part('Average current', 'mA', avg, `[${hi} × ${duty} + ${lo} × (100 − ${duty})] ÷ 100`),
                part('Battery life', 'h', c/avg, `${c} ÷ unrounded average current`)];
        }],
        losses: ['3.1.6', 'Electrical energy and losses', r => {
            const v = r(15, 54), i = r(18, 69)/10, h = r(13, 57)/10, eff = r(55, 94);
            const input = v*i;
            return [`A drive takes ${i} A at ${v} V for ${h} hours, operating at ${eff}% efficiency. Find power lost and energy drawn.`,
                part('Power lost', 'W', input*(100-eff)/100, `${v} × ${i} × (100 − ${eff}) ÷ 100`),
                part('Input energy', 'kWh', input*h/1000, `${v} × ${i} × ${h} ÷ 1000`)];
        }],
        decibels: ['3.2.1', 'Amplifier gains in decibels', r => {
            const vi = r(12, 92), vo = r(25, 425), ii = r(16, 82), io = r(25, 220);
            const vin = vi/100, vout = vo/100, iin = ii/100, iout = io/100;
            return [`An analogue stage takes ${vin} V and ${iin} mA and produces ${vout} V and ${iout} mA. Find the voltage, current and power gains in decibels.`,
                part('Voltage gain', 'dB', 20*log10(vo/vi), `20 log₁₀(${vout}/${vin})`),
                part('Current gain', 'dB', 20*log10(io/ii), `20 log₁₀(${iout}/${iin})`),
                part('Power gain', 'dB', 10*log10((vo*io)/(vi*ii)), `10 log₁₀[(${vout}/${vin}) × (${iout}/${iin})]`)];
        }],
        cascade: ['3.2.1', 'Cascaded amplifiers', r => {
            const a = r(2, 12), hundredths = r(15, 78), c = r(2, 9), v = r(8, 57)/100;
            const b = hundredths / 100, gain = a * hundredths * c / 100;
            return [`A ${v} V signal enters three stages with voltage ratios ${a}, ${b} and ${c}. Find the overall gain as a ratio and in dB, and the final voltage.`,
                part('Voltage ratio', '', gain, `${a} × ${b} × ${c}`),
                part('Gain in decibels', 'dB', 20*log10(gain), '20 log₁₀(unrounded overall voltage ratio)'),
                part('Output voltage', 'V', v*gain, `${v} × unrounded overall voltage ratio`)];
        }],
        opamp: ['3.2.1', 'Inverting and non-inverting op-amps', r => {
            const inv = r(0,1), resistor = r(4, 22), feedback = r(23, 68), vin = r(10, 34)/100;
            const gain = inv ? -feedback/resistor : 1+feedback/resistor;
            const connection = inv ? 'in series between the signal and the inverting input' : 'between the inverting input and ground';
            return [`An ideal ${inv ? 'inverting' : 'non-inverting'} amplifier has a ${feedback} kΩ feedback resistor and a ${resistor} kΩ resistor ${connection}. Input is ${vin} V and the circuit operates linearly. Find signed gain and output voltage.`,
                part('Signed voltage gain', '', gain, inv ? `−${feedback} ÷ ${resistor}` : `1 + ${feedback} ÷ ${resistor}`),
                part('Signed output voltage', 'V', gain*vin, `${vin} × unrounded voltage gain`)];
        }],
        bandwidth: ['3.2.1', 'Cutoff frequency and bandwidth', r => {
            const low = r(10, 80)*10, high = r(101, 850)*10, mid = r(9, 42);
            return [`An amplifier has midband gain ${mid} dB and −3 dB cutoff frequencies of ${low} Hz and ${high} Hz. Find the gain at the cutoffs and the bandwidth.`,
                part('Cutoff gain', 'dB', mid-3, `${mid} − 3`),
                part('Bandwidth', 'Hz', high-low, `${high} − ${low}`)];
        }]
    };

    function generate(id, random = Math.random) {
        if (!Object.hasOwn(families, id)) throw new RangeError('Unknown engineering maths exercise.');
        const [ref, title, make] = families[id];
        const integer = (min, max) => min + Math.floor(random() * (max - min + 1));
        const [q, ...parts] = make(integer);
        return {t: 'calc', id, ref, title, q, parts, marks: parts.length};
    }

    const skills = Object.fromEntries(Object.entries(families).map(([id, [ref, title]]) => [id, {ref, title}]));
    function groupFor(ref) {
        return ref.slice(0, ref.lastIndexOf('.'));
    }

    return {groups, skills, groupFor, generate, display};
});

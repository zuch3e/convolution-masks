// Neleptcu Daniel-Andrei - Tema 3 TW
const canvas = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const ctx = canvas.getContext('2d');
const ctx2 = canvas2.getContext('2d', { willReadFrequently: true });
// Am creat 2 canvas-uri, in primul se va mentine poza originala, si in al doilea va fi prelucrata;
// Canvasul 2 are atributul willReadFrequently: true deoarece se va ceve getImageData in mod
// repetat, iar acest atribut face request-ul mai rapid;


canvas.width = 1000;
canvas.height = 700;
canvas2.width = 1000;
canvas2.height = 700;
//Am ales width/height fix de 1000/700 pixeli, iar imaginile din dog api vor fi 'stretched' in aceasta
//rezolutie


const imagine = new Image();                    // Imaginea 

imagine.setAttribute('crossOrigin', 'anonymous');
function fetchDogAPI() {                        // functia apelata din butonul din HTML <Imagine>
    const timpInceput1 = performance.now();                     //timpul la inceputul functiei

    url = "https://dog.ceo/api/breeds/image/random";
    async function fetchCaini() {                                           //functia asincrona de prelucrare a JSON-ului din dog api
        const response = await fetch(url);
        const caini = await response.json();
        return caini;
    }
    fetchCaini().then(function (linkCaini) {
        // "https://api.codetabs.com/v1/proxy?quest=" + 
        imagine.src =  linkCaini.message;
        console.log(imagine.src);
        const timpSfarsit1 = performance.now();
        console.log(`Timp executie fetch: ${timpSfarsit1 - timpInceput1} ms`);
        document.getElementById("t1").innerHTML = (timpSfarsit1 - timpInceput1).toFixed(3) + 'ms';
    })
        .catch(function (error) {
            console.log("Eroare:" + error)
        })
}
function reAfiseaza() {
    ctx2.restore();
    ctx2.drawImage(imagine, 0, 0, canvas2.width, canvas2.height);
}
function mirror() {
    const timpInceput = performance.now();
    var ImagineActuala_Data = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
    var pixeli_ImagineActuala = ImagineActuala_Data.data;
    console.log(pixeli_ImagineActuala);
    for (i = 0; i < canvas.height; i++)
        for (j = 0; j < canvas.width / 2; j++) {
            for (k = 0; k <= 3; k++) {
                var PaharSchimb = pixeli_ImagineActuala[i * 4 * canvas2.width + j * 4 + k];
                pixeli_ImagineActuala[i * 4 * canvas2.width + j * 4 + k] = pixeli_ImagineActuala[i * 4 * canvas2.width + 4 * (canvas2.width - j) + k];
                pixeli_ImagineActuala[i * 4 * canvas2.width + 4 * (canvas2.width - j) + k] = PaharSchimb;
            }
        }
    ctx2.putImageData(ImagineActuala_Data, 0, 0);
    const timpSfarsit = performance.now();
    console.log(`Timp executie mirror: ${timpSfarsit - timpInceput} ms`);
    document.getElementById("t2").innerHTML = (timpSfarsit - timpInceput).toFixed(3) + 'ms';
    srcBuff = ctx2.getImageData(0, 0, canvas2.width, canvas2.height).data;
}

function sharpening() {
    const timpInceput = performance.now();
    var cerinta = document.getElementById("optiuni").value;
    var indice = document.getElementById("indice").value;
    //sharpen/blur/outline/emboss/top sobel/bottom sobel/ left sobel/ right sobel
    var kernel = [
        [0, -1, 0, -1, 5, -1, 0, -1, 0], // sharpening
        [0.0625, 0.125, 0.0625, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625], // blur
        [-1, -1, -1, -1, 8, -1, -1, -1, -1], // contur
        [-2, -1, 0, -1, 1, 1, 0, 1, 2], // emboss
        [1,2,1,0,0,0,-1,-2,-1], //top sobel
        [-1,-2,-1,0,0,0,1,2,1], //bottom sobel
        [1,0,-1,2,0,-2,1,0,-1], //left sobel
        [-1,0,1,-2,0,2,-1,0,1] //right sobel
    ];
    console.log(kernel);
    setTimeout(function sharpen() {
        var x, sx, sy, r, g, b, a, dstOff, srcOff, wt, cx, cy, scy, scx,
            dstData = ctx2.createImageData(canvas2.width, canvas2.height),
            dstBuff = dstData.data,
            y = canvas2.height;
        while (y--) {
            x = canvas2.width;
            while (x--) {
                sy = y;
                sx = x;
                dstOff = (y * canvas2.width + x) * 4;
                r = 0;
                g = 0;
                b = 0;
                a = 0;
                for (cy = 0; cy < 3; cy++) {
                    for (cx = 0; cx < 3; cx++) {
                        scy = sy + cy - 1;
                        scx = sx + cx - 1;
                        if (scy >= 0 && scy < canvas2.height && scx >= 0 && scx < canvas2.width) {
                            srcOff = (scy * canvas2.width + scx) * 4;
                            wt = kernel[cerinta][cy * 3 + cx];

                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }

                dstBuff[dstOff] = r * indice + srcBuff[dstOff] * (1 - indice);
                dstBuff[dstOff + 1] = g * indice + srcBuff[dstOff + 1] * (1 - indice);
                dstBuff[dstOff + 2] = b * indice + srcBuff[dstOff + 2] * (1 - indice);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx2.putImageData(dstData, 0, 0);
        const timpSfarsit = performance.now();
        console.log(`Timp executie sharpen: ${timpSfarsit - timpInceput - 2000} ms`);
        document.getElementById("t3").innerHTML = (timpSfarsit - timpInceput - 2000).toFixed(3) + 'ms';
    }, 2000);

}

imagine.addEventListener('load', function () {
    ctx.drawImage(imagine, 0, 0, canvas.width, canvas.height);
    ctx2.drawImage(imagine, 0, 0, canvas2.width, canvas2.height);
    srcBuff = ctx2.getImageData(0, 0, canvas2.width, canvas2.height).data;
    ctx2.save();
})









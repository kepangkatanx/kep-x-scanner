const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwvs041UChld2gLXYH48MpTglRPOaBeIA1l9ew_UB2HcOyhjnBa9-iNTO_xdGL_pe-SAA/exec";

const btnScan = document.getElementById("btnScan");
const hasil = document.getElementById("hasil");

let scanner = null;
let scanning = false;
function beep() {

    const audio = new Audio(
        "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
    );

    audio.play();

}
btnScan.addEventListener("click", startCamera);

function startCamera() {

    if (scanning) return;

    scanning = true;
    btnScan.disabled = true;
    btnScan.innerHTML = "📷 Kamera Aktif";

    hasil.className = "info";
    hasil.innerHTML = "📷 Membuka kamera...";

    scanner = new Html5Qrcode("reader");

    scanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        onScanSuccess,
        function () {
            // abaikan error pembacaan per frame
        }
    ).catch(err => {

        scanning = false;
        btnScan.disabled = false;
        btnScan.innerHTML = "📷 Aktifkan Kamera";

        hasil.className = "info error";
        hasil.innerHTML = "❌ " + err;

    });

}

function onScanSuccess(decodedText) {

    scanner.stop().then(() => {

        scanning = false;

        prosesAbsensi(decodedText.trim());

    });

}

function prosesAbsensi(id) {

    hasil.className = "info";
    hasil.innerHTML = "⏳ Memproses absensi...";

    fetch(WEBAPP_URL + "?action=absen&id=" + encodeURIComponent(id))
    .then(r => r.json())
    .then(data => {

        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

        const jam = new Date().toLocaleTimeString("id-ID");

        if (data.sukses) {

            hasil.className = "info success";

            hasil.innerHTML = `
                <h2>✅ ABSENSI BERHASIL</h2>
                <p><strong>${data.nama}</strong></p>
                <p>Kelompok ${data.kelompok}</p>
                <p>${jam}</p>
            `;

        } else {

            hasil.className = "info warning";

            hasil.innerHTML = `
                <h2>⚠️</h2>
                <p>${data.pesan}</p>
                <p>${jam}</p>
            `;

        }

        setTimeout(() => {

            document.getElementById("reader").innerHTML = "";

            btnScan.disabled = false;
            btnScan.innerHTML = "📷 Kamera Aktif";

            startCamera();

        },3000);

    })
    .catch(err=>{

        hasil.className="info error";

        hasil.innerHTML=`
            <h2>❌ Terjadi Kesalahan</h2>
            <p>${err}</p>
        `;

        btnScan.disabled=false;
        btnScan.innerHTML="📷 Aktifkan Kamera";

    });

}

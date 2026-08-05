const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwvs041UChld2gLXYH48MpTglRPOaBeIA1l9ew_UB2HcOyhjnBa9-iNTO_xdGL_pe-SAA/exec";

let btnScan;
let hasil;

let scanner = null;
let scanning = false;

let lastScannedId = "";
let lastScanTime = 0;

const SCAN_DELAY = 5000;

const successSound = new Audio("sounds/success.mp3");
successSound.volume = 0.7;


function beep() {
    successSound.currentTime = 0;
    successSound.play().catch(err => {
        console.log("Gagal memutar audio:", err);
    });
}

window.addEventListener("DOMContentLoaded", () => {

    btnScan = document.getElementById("btnScan");
    hasil = document.getElementById("hasil");

    btnScan.addEventListener("click", startCamera);

});

function startCamera() {
    
    if (scanner) {
        return;
    }

    btnScan.disabled = true;
    btnScan.innerHTML = "📷 Scanner Aktif";

    hasil.className = "info";
    hasil.innerHTML = "📷 Membuka Scanner...";

    scanner = new Html5Qrcode("reader");

    scanner.start(
        { facingMode: "environment" },
        {
            fps: 20,
            qrbox: 200
        },
        onScanSuccess,
        () => {}
    )
    .then(() => {
        scanning = false;
    })
    .catch(err => {

        scanner = null;
        scanning = false;

        btnScan.disabled = false;
        btnScan.innerHTML = "📷 Aktifkan Scanner";

        hasil.className = "info error";
        hasil.innerHTML = "❌ " + err;

    });

}

function onScanSuccess(decodedText) {

    const now = Date.now();
    decodedText = decodedText.trim();

    if (
        decodedText === lastScannedId &&
        (now - lastScanTime) < SCAN_DELAY
    ) {
        return;
    }

    if (scanning) return;

    scanning = true;

    lastScannedId = decodedText;
    lastScanTime = now;

    prosesAbsensi(decodedText);

}

function prosesAbsensi(id) {

    hasil.className = "info";
    hasil.innerHTML = "⏳ Memproses Absensi...";

    fetch(WEBAPP_URL + "?action=absen&id=" + encodeURIComponent(id))
        .then(r => r.json())
        .then(data => {

            if (navigator.vibrate) {
                navigator.vibrate(200);
            }

            const jam = new Date().toLocaleTimeString("id-ID");

            if (data.sukses) {

                beep();
                
                hasil.className = "info success";

                hasil.innerHTML = `
                    <div class="scan-title">
                        ✅ ABSENSI BERHASIL
                    </div>

                    <div class="scan-name">
                        ${data.nama}
                    </div>

                    <div class="scan-group">
                        Kelompok <strong>${data.kelompok}</strong>
                    </div>

                    <div class="scan-time">
                        🕒 ${jam} WIB
                    </div>
            `    ;

            } else {

                hasil.className = "info warning";

                hasil.innerHTML = `
                <div class="scan-title">
                    ⚠️ SUDAH ABSEN
                </div>

                <div class="scan-name" style="font-size:24px;">
                    ${data.pesan}
                </div>

                <div class="scan-time">
                    🕒 ${jam} WIB
                </div>
                `;

            }

            setTimeout(() => {
                scanning = false;
            }, 1000);

        })
        .catch(err => {

            hasil.className = "info error";

            hasil.innerHTML = `
            <div class="scan-title">
                ❌ TERJADI KESALAHAN
            </div>

            <div class="scan-name" style="font-size:22px;">
                ${err}
            </div>
            `;
            scanning = false;

        });

}

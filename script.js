/*************************************************
SIGAP KAKA
Script.html
Versi 2.1 (Y.T.W)
*************************************************/

let dataHarga = [];
let dataKomoditi = [];
let dataTampil = [];
let grafikCache = {};
let chart = null;

const API = "https://script.google.com/macros/s/AKfycby4Nj4f_VqvNUXb64WcOfIoowbzS_mEXdo6jJqaZLcFjzw4erkFkGmrAFMrgGxn9diy/exec";

/*==============================
LOAD APLIKASI
==============================*/
window.onload = async function () {

    try {
        await loadInitialData();

        // Hilangkan loading segera setelah data utama siap
        document.getElementById("loading").style.display = "none";

        // Jalankan sisanya tanpa menunggu
        setTimeout(loadGrafik, 0);
        setTimeout(loadKomoditasSlider, 0);
        setTimeout(loadPeta, 0);

    } catch (err) {

        console.error(err);
        document.getElementById("loading").style.display = "none";

    }

}
async function loadInitialData() {

    try {

        const response = await fetch(API + "?action=getInitialData");
        const data = await response.json();

        // Dashboard
        document.getElementById("jumlahKomoditi").innerHTML =
            data.dashboard.jumlah;

       document.getElementById("hargaTertinggi").innerHTML =
    (data.dashboard.naik || 0) + " Komoditas";

let naik = data.dashboard.daftarNaik.slice(0,3);

if(data.dashboard.daftarNaik.length > 3){

    naik.push('<span class="dashboard-more">+' +
(data.dashboard.daftarNaik.length - 3) +
' lainnya</span>');

}

document.getElementById("listNaik").innerHTML =
    naik
        .filter(item => item && item.trim() !== "")
        .map(item => "• " + item)
        .join("<br>");

document.getElementById("hargaTerendah").innerHTML =
    (data.dashboard.turun || 0) + " Komoditas";

let turun = data.dashboard.daftarTurun.slice(0,3);

if(data.dashboard.daftarTurun.length > 3){

    turun.push('<span class="dashboard-more">+' +
(data.dashboard.daftarTurun.length - 3) +
' lainnya</span>');

}

document.getElementById("listTurun").innerHTML =
    turun
        .filter(item => item && item.trim() !== "")
        .map(item => "• " + item)
        .join("<br>");
        document.getElementById("updateTerakhir").innerHTML =
            data.dashboard.update;

        // Data Harga
        dataHarga = data.harga;
        dataTampil = data.harga;

        tampilkanTabel(dataTampil);

        // Komoditi
dataKomoditi = data.komoditi;

let html = '<option value="">Semua Komoditas</option>';

dataKomoditi.forEach(function(k){

    html += `<option value="${k}">${k}</option>`;

});

document.getElementById("filterKomoditi").innerHTML = html;

        // Galeri
if(data.galeri){

    dataGaleri = data.galeri;

    if(dataGaleri.length){

        tampilGaleri();

        if(!window.galeriTimer){

            window.galeriTimer =
                setInterval(nextGaleri,10000);

        }

    }

}

    } catch (err) {

        console.error("Load Initial Data gagal:", err);

    }

}

/*==============================
LOAD DATA
==============================*/

async function loadData() {

    try {

        const response = await fetch(API + "?action=getInitialData");

        console.log("Status:", response.status);

        const hasil = await response.json();
        alert("Jumlah data: " + hasil.length);

        console.log(hasil);
        console.log("JUMLAH:", hasil.length);

        dataHarga = hasil;
        dataTampil = hasil;

        tampilkanTabel(dataTampil);

        loadKomoditasSlider();

        loadGrafik();

    } catch (err) {

        console.error("Load Data gagal:", err);

    }

}

/*==============================
TABEL
==============================*/

function tampilkanTabel(data) {

    let html = "";

    data.forEach(function (item, index) {

        let status = badgeStatus(item.harga, item.hargaSebelumnya);

        let badgeStok = "";

if(item.ketersediaan=="Banyak"){

    badgeStok='<span class="badge-banyak">🟢 Banyak</span>';

}else if(item.ketersediaan=="Cukup"){

    badgeStok='<span class="badge-cukup">🟡 Cukup</span>';

}else{

    badgeStok='<span class="badge-kurang">🔴 Kurang</span>';

}

html += `
<tr>

<td class="text-center">

<span class="nomor-urut">

${index+1}

</span>

</td>

<td>

<span class="nama-komoditi">

${iconKomoditi(item.komoditi)} ${item.komoditi}

</span>

</td>

<td class="text-end">

Rp ${Number(item.harga).toLocaleString("id-ID")}

</td>

<td class="text-center">

<span class="badge-satuan">

${item.satuan}

</span>

</td>

<td class="text-center">

<span class="badge-tanggal">

📅 ${item.tanggal}

</span>

</td>

<td class="text-center">

${badgeStok}

</td>

<td class="text-center">

${status}

</td>

</tr>
`;

    });

    document.getElementById("tbodyHarga").innerHTML = html;

}

/*==============================
LOAD KOMODITI
==============================*/

    async function loadKomoditi() {

    try {

        const response = await fetch(API + "?action=getKomoditi");
        const list = await response.json();

        dataKomoditi = list;

        let html = '<option value="">Semua Komoditas</option>';

        list.forEach(function(k) {

            html += `<option value="${k}">${k}</option>`;

        });

        document.getElementById("filterKomoditi").innerHTML = html;

    } catch (err) {

        console.error("Load Komoditi gagal:", err);

    }

}

/*==================================================
LOGOUT
==================================================*/

function logout(){

    sessionStorage.removeItem("ROLE");
    sessionStorage.removeItem("NAMA");

    document.getElementById("btnExport").style.display="none";
    document.getElementById("btnHistori").style.display="none";

    tampilToast("Logout berhasil.");

    setTimeout(function(){

    window.location.href = API;

},1000);

}

/*==================================================
STATUS HARGA
==================================================*/

function badgeStatus(hargaBaru,hargaLama){

    if(Number(hargaBaru)>Number(hargaLama)){

        return '<span class="badge-naik">▲ Naik</span>';

    }

    if(Number(hargaBaru)<Number(hargaLama)){

        return '<span class="badge-turun">▼ Turun</span>';

    }

    return '<span class="badge-tetap">➖ Tetap</span>';

}

function iconKomoditi(nama){

    nama = nama.toLowerCase();

    if(nama.includes("beras")) return "🌾";

    if(nama.includes("cabai")) return "🌶️";

    if(nama.includes("bawang")) return "🧅";

    if(nama.includes("telur")) return "🥚";

    if(nama.includes("ayam")) return "🐔";

    if(nama.includes("daging")) return "🥩";

    if(nama.includes("ikan")) return "🐟";

    if(nama.includes("minyak")) return "🫗";

    if(nama.includes("gula")) return "🍚";

    if(nama.includes("garam")) return "🧂";

    if(nama.includes("tepung")) return "🌾";

    return "🛒";

}

/*==================================================
TOAST
==================================================*/

function tampilToast(pesan){

    document.getElementById("toastBody").innerHTML=pesan;

    const toast=new bootstrap.Toast(

        document.getElementById("toastInfo")

    );

    toast.show();

}

/*==================================================
BACK TO TOP
==================================================*/

window.onscroll=function(){

    if(document.body.scrollTop>200 ||

       document.documentElement.scrollTop>200){

        document.getElementById("btnTop").style.display="block";

    }else{

        document.getElementById("btnTop").style.display="none";

    }

};

document.getElementById("btnTop")
.addEventListener("click",function(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});

/*==================================================
REFRESH
==================================================*/

function refreshData(){

    document.getElementById("loading").style.display="flex";

    loadInitialData();

    setTimeout(function(){

        document.getElementById("loading").style.display="none";

    },800);

}

/*==================================================
AUTO REFRESH
==================================================*/

setInterval(function(){

    loadInitialData();

},300000); // 5 menit

/*==================================================
FORMAT RUPIAH
==================================================*/

function rupiah(nilai){

    return "Rp " +

    Number(nilai).toLocaleString("id-ID");

}

document.getElementById("filterKomoditi")
.addEventListener("change", function(){

    filterData();

    loadGrafik();

});

document.getElementById("filterTanggal")
.addEventListener("change", filterData);

    async function filterData() {

    const komoditi = document.getElementById("filterKomoditi").value;
    const tglInput = document.getElementById("filterTanggal").value;

    if (tglInput == "") {

        let hasil = dataHarga;

        if (komoditi != "") {
            hasil = hasil.filter(item => item.komoditi == komoditi);
        }

        tampilkanTabel(hasil);
        buatGrafik(hasil);
        return;

    }

    const p = tglInput.split("-");
    const tanggal = p[2] + "/" + p[1] + "/" + p[0];

    try {

        const response = await fetch(
            API +
            "?action=getHargaFilter" +
            "&tanggal=" + encodeURIComponent(tanggal) +
            "&komoditi=" + encodeURIComponent(komoditi)
        );

        let data = await response.json();

        tampilkanTabel(data);
        buatGrafik(data);

    } catch (err) {

        console.error(err);

    }

}

/* ==========================================
   ICON KOMODITAS
========================================== */

function getEmojiKomoditas(nama){

    const n = String(nama).toLowerCase().trim();


    /* =========================
       BERAS
    ========================= */

    if(n.includes("beras medium"))
        return "🍚";

    if(n.includes("beras premium"))
        return "🌾";

    if(n.includes("beras sphp"))
        return "🌾";


    /* =========================
       MINYAK
    ========================= */

    if(n.includes("minyak kita") || n.includes("minyakita"))
        return "🧴";

    if(n.includes("minyak goreng"))
        return "🍳";


    /* =========================
       SAYUR
    ========================= */

    if(n === "kol" || n.includes("kubis"))
    return "🥬";

    if(n.includes("sawi"))
        return "🥬";

    if(n.includes("kangkung"))
        return "🌿";

    if(n.includes("bayam"))
        return "🍃";


    /* =========================
       KEDELAI DAN TEMPE
    ========================= */

    if(n.includes("kedelai"))
        return "🫘";

    if(n.includes("tempe"))
        return "🟫";


    /* =========================
       TEPUNG
    ========================= */

    if(n.includes("tepung"))
        return "🥣";


    /* =========================
       BAWANG
    ========================= */

    if(n.includes("bawang merah"))
        return "🧅";

    if(n.includes("bawang putih"))
        return "🧄";


    /* =========================
       CABAI
    ========================= */

    if(n.includes("cabai"))
        return "🌶️";


    /* =========================
       TELUR
    ========================= */

    if(n.includes("telur"))
        return "🥚";


    /* =========================
       DAGING
    ========================= */

    if(n.includes("daging ayam"))
        return "🍗";

    if(n.includes("daging sapi"))
        return "🥩";


    /* =========================
       IKAN
    ========================= */

    if(n.includes("ikan tongkol"))
        return "🐟";

    if(n.includes("ikan kembung"))
        return "🐟";

    if(n.includes("ikan"))
        return "🐟";


    /* =========================
       GULA DAN GARAM
    ========================= */

    if(n.includes("gula"))
        return "🍬";

    if(n.includes("garam"))
        return "🧂";


    /* =========================
       KOMODITAS LAIN
    ========================= */

    if(n.includes("jagung"))
        return "🌽";

    if(n.includes("kentang"))
        return "🥔";

    if(n.includes("tomat"))
        return "🍅";

    if(n.includes("wortel"))
        return "🥕";

    /* DEFAULT */

    return "🧺";

}

/* ==========================================
   LOAD SLIDER KOMODITAS
========================================== */

async function loadKomoditasSlider() {

    try {

        const data = dataHarga;

        const track = document.getElementById("komoditasTrack");

        if (!track) return;

        let html = "";

        data.forEach(function(item){

            const nama = item.komoditi;

            let tren = "";

if(Number(item.harga) > Number(item.hargaSebelumnya)){

    tren = "🔺 Naik";

}else if(Number(item.harga) < Number(item.hargaSebelumnya)){

    tren = "🔻 Turun";

}else{

    tren = "➖ Stabil";

}

            let stok = "";

switch(item.ketersediaan){

    case "Banyak":
        stok = "🟢 Banyak";
        break;

    case "Cukup":
        stok = "🟡 Cukup";
        break;

    case "Kurang":
        stok = "🔴 Kurang";
        break;

    default:
        stok = item.ketersediaan;

}

            html += `
            <div class="komoditas-item">

                <div class="komoditas-foto">
                    <span class="emoji-komoditas">
                        ${getEmojiKomoditas(nama)}
                    </span>
                </div>

                <div class="komoditas-nama">
                    ${nama}
                </div>
                <div class="komoditas-harga">
                 Rp ${Number(item.harga).toLocaleString("id-ID")}
                </div>
                <div class="komoditas-tren">
                ${tren}
                </div>
                <div class="komoditas-stok">
                ${stok}
                </div>

            </div>
            `;

        });

        track.innerHTML = html + html;

        catch(err){

        console.error(err);

    }

}

/* ======================================
   GALERI FOTO SIGAP KAKA
====================================== */

let dataGaleri = [];
let indexGaleri = 0;

async function loadGaleri() {

    try {

        const response = await fetch(API + "?action=getGaleri");
        dataGaleri = await response.json();

        if (dataGaleri.length > 0) {

            tampilGaleri();

            setInterval(nextGaleri, 10000);

        }

    } catch(err){

        console.error(err);

    }

}
function tampilGaleri(){

    if(dataGaleri.length === 0) return;

    const foto = document.getElementById("galeriFoto");
    const judul = document.getElementById("galeriJudul");

    foto.style.animation = "none";

    void foto.offsetWidth;

    foto.style.animation = "kenburns 10s linear forwards";

    foto.src = dataGaleri[indexGaleri].foto;

    judul.textContent = dataGaleri[indexGaleri].judul;

}

function nextGaleri(){

    indexGaleri++;

    if(indexGaleri >= dataGaleri.length){

        indexGaleri = 0;

    }

    tampilGaleri();

}

let map;

function loadPeta(){

    if(map) return;

    map = L.map("mapKupang",{
        zoomControl:true
    }).setView([-10.1050,123.8150],10);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:"© OpenStreetMap",
            maxZoom:19
        }
    ).addTo(map);

    // Dinas Pertanian dan Ketahanan Pangan
    L.marker([-10.074305,123.869481])
    .addTo(map)
    .bindPopup(`
        <b>Dinas Pertanian dan Ketahanan Pangan</b><br>
        Kompleks Kantor Bupati Kupang<br>
        Oelamasi
    `);

    // Marker Pasar Oesao
L.marker([-10.11713, 123.80887])
.addTo(map)
.bindPopup(`
<b>Pasar Oesao</b><br>
Kecamatan Kupang Timur
`);

}

function loadGrafik(){

    let komoditi = document.getElementById("filterKomoditi").value;

    if(komoditi==""){

        komoditi = dataHarga[0]?.komoditi;

    }

    if(!komoditi) return;

    // Kalau sudah pernah diambil
    if(grafikCache[komoditi]){

        buatGrafik(grafikCache[komoditi]);
        return;

    }

    fetch(
        API +
        "?action=getGrafikKomoditi&komoditi=" +
        encodeURIComponent(komoditi)
    )
    .then(res=>res.json())
    .then(function(grafik){

        grafikCache[komoditi]=grafik;

        buatGrafik(grafik);

    })
    .catch(console.error);

}

/*==================================================
GRAFIK TREN HARGA PREMIUM
==================================================*/

function buatGrafik(data){

    const label = [];
    const nilai = [];

    data.forEach(function(item){

    label.push(item.tanggal);
    nilai.push(Number(item.harga));

});

    const canvas = document.getElementById("chartHarga");
    const ctx = canvas.getContext("2d");

    if(chart){
        chart.destroy();
    }

    const gradient = ctx.createLinearGradient(0,0,0,350);

    gradient.addColorStop(0,"rgba(34,197,94,0.35)");
    gradient.addColorStop(1,"rgba(34,197,94,0)");

    chart = new Chart(ctx,{

        type:"line",

        data:{

            labels:label,

            datasets:[{

                label:"Harga Pangan",

                data:nilai,

                borderColor:"#16a34a",

                backgroundColor:gradient,

                fill:true,

                borderWidth:4,

                tension:0.4,

                pointRadius:5,

                pointHoverRadius:8,

                pointBackgroundColor:"#ffffff",

                pointBorderColor:"#16a34a",

                pointBorderWidth:3

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            interaction:{
                intersect:false,
                mode:"index"
            },

            animation:{
                duration:1800,
                easing:"easeOutQuart"
            },

            plugins:{

                legend:{
                    display:false
                },

                tooltip:{

                    backgroundColor:"#ffffff",

                    titleColor:"#111827",

                    bodyColor:"#111827",

                    borderColor:"#16a34a",

                    borderWidth:1,

                    padding:12,

                    displayColors:false,

                    callbacks:{

                        label:function(context){

                            return "Harga : Rp " +
                            context.parsed.y.toLocaleString("id-ID");

                        }

                    }

                }

            },

            scales:{

                x:{

                    grid:{
                        display:false
                    },

                    ticks:{
                        color:"#374151",
                        maxRotation:45,
                        minRotation:45
                    }

                },

                y:{

                    beginAtZero:false,

                    grid:{
                        color:"rgba(0,0,0,0.06)"
                    },

                    ticks:{

                        color:"#374151",

                        callback:function(value){

                            return "Rp " +
                            Number(value).toLocaleString("id-ID");

                        }

                    }

                }

            }

        }

    });

}

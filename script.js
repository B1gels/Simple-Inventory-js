// tampilkan table ketika semua konten html sudah dimuat
window.addEventListener("DOMContentLoaded", () => {
    renderTable()

})

// tombol submit 
const submitBtn = document.getElementById("submitBtn")
submitBtn.addEventListener("click", function (e) {
    e.preventDefault()
    handleSubmit()
})


let dataID = null
let barangSedangDiedit = null

// fungsi untuk search barang menggunakan text input
document.getElementById("searchInput").addEventListener("input",debounce(searchBarang,500))

function searchBarang(){
    const userKeyword = document.getElementById("searchInput").value.toLowerCase()
    let listBarang = JSON.parse(localStorage.getItem("listBarang")) || []
    
    const hasilFilter = listBarang.filter(barang => barang.nama.toLowerCase().includes(userKeyword.trim()))
    renderTable(hasilFilter)
    console.log("jawa")
}

// fungsi untuk menampilkan data ke table
function renderTable(data = null) {

    let listBarang = data || JSON.parse(localStorage.getItem("listBarang")) || []
    const table = document.getElementById("itemTable")
    const tableBody = document.getElementById("itemTableBody")
    const emptyProduk = document.getElementById("emptyProduk")

    // kosongkan table ketika pertama kali ditampilkan (mencegah data double dan empty produk tampil)
    tableBody.innerHTML = ""
    emptyProduk.style.display = "none"


    // kondisi ketika table kosong
    if (listBarang.length === 0) {
        emptyProduk.style.display = "table-row"
        return 0
    }


    listBarang.forEach((Barang, index) => {
        // buat row table terlebih dahulu
        const row = document.createElement("tr")
        const IDcell = document.createElement("td")
        const codeCell = document.createElement("td")
        const NameCell = document.createElement("td")
        const PriceCell = document.createElement("td")
        const StockCell = document.createElement("td")

        const editTable = document.createElement("td")
        const editBTN = document.createElement("button")
        const deleteBTN = document.createElement("button")

        // set value
        IDcell.textContent = `#${Barang.id}`
        codeCell.textContent = Barang.kode
        NameCell.textContent = Barang.nama
        PriceCell.textContent = formatRupiah(Barang.harga, "Rp")
        StockCell.textContent = Barang.stok
        editBTN.innerHTML = '<i class="fa-solid fa-pen"></i> '
        deleteBTN.innerHTML = '<i class="fa-solid fa-trash-can"></i>'

        // set atribut
        NameCell.style.textTransform = "capitalize"
        editTable.classList.add("tombol-aksi")
        editBTN.setAttribute("class", "tombol-edit")
        deleteBTN.setAttribute("class", "tombol-hapus")

        // tampilkan ke halaman
        tableBody.appendChild(row)
        row.appendChild(IDcell)
        row.appendChild(codeCell)
        row.appendChild(NameCell)
        row.appendChild(PriceCell)
        row.appendChild(StockCell)

        row.appendChild(editTable)
        editTable.appendChild(editBTN)
        editTable.appendChild(deleteBTN)

        table.appendChild(tableBody)


        // fungsi untuk edit button
        editBTN.addEventListener("click", function () {
            dataID = Barang.id

            barangSedangDiedit = listBarang.filter(produk => produk.id === dataID)
            editBarang(barangSedangDiedit)
        })

        // fungsi untuk delete button
        deleteBTN.addEventListener("click", () => {
            if(confirm(`yakin ingin menghapus produk "${Barang.nama}" ?`)){
                deleteProduk(index)
            }
        })

    });

    hitungStatistik()
}
// fungsi untuk barang yang sedang di edit
function editBarang(barangSedangDiedit) {
    const submitBtn = document.getElementById("submitBtn")

    const itemName = document.getElementById("itemName")
    const itemPrice = document.getElementById("itemPrice")
    const itemStock = document.getElementById("itemStock")
    const itemCode = document.getElementById("itemCode")

    // MASUKKAN NILAI KE FORM UNTUK MENGEDIT
    itemName.value = barangSedangDiedit[0].nama
    itemPrice.value = barangSedangDiedit[0].harga
    itemStock.value = barangSedangDiedit[0].stok
    itemCode.value = barangSedangDiedit[0].kode

    submitBtn.textContent = "Update Barang"

}


// fungsi submit dari form
function handleSubmit() {

    const itemName = document.getElementById("itemName")
    const itemPrice = document.getElementById("itemPrice")
    const itemStock = document.getElementById("itemStock")
    const itemCode = document.getElementById("itemCode")

    // terpenuhi ketika masuk ke mode update
    if (barangSedangDiedit !== null) {
        let listBarang = JSON.parse(localStorage.getItem("listBarang")) || []


        listBarang = listBarang.map((produk) => {
            return produk.id === dataID ? {
                id: dataID,
                kode: itemCode.value,
                nama: itemName.value,
                harga: itemPrice.value,
                stok: itemStock.value
            } : { ...produk }
        })

        localStorage.setItem("listBarang", JSON.stringify(listBarang))

        renderTable()
        clearForm()


        return alert("Data berhasil di update")
    }


    // mode biasa untuk menambahkan barang
    if (itemName.value.trim() && itemPrice.value.trim() && itemStock.value.trim()) {
        let listBarang = JSON.parse(localStorage.getItem("listBarang")) || []

        listBarang.push({
            id: generateID(),
            kode: generateCode(itemCode),
            nama: itemName.value,
            harga: itemPrice.value,
            stok: itemStock.value
        })

        localStorage.setItem("listBarang", JSON.stringify(listBarang))
        renderTable()
        clearForm()


    } else {
        alert("form tidak boleh kosong")
    }
}

// fungsi untuk menghapus semua isi tabel
const deleteAllBtn = document.getElementById("deleteAll")
deleteAllBtn.addEventListener("click",()=>{
    if(confirm("hapus semua data didalam tabel?")){
        localStorage.removeItem("listBarang")
        renderTable()
        alert("semua data berhasil dihapus!")
    }
})

// fungsi debounce untuk menangani search input
function debounce(func,delay){
    let timeoutId;

    return function(...args){
        clearTimeout(timeoutId)
        timeoutId = setTimeout(()=>{
            func.apply(this,args)
        },delay)
    }

}

// fungsi hapus barang
function deleteProduk(index) {
    let listBarang = JSON.parse(localStorage.getItem("listBarang")) || []
    listBarang.splice(index, 1)

    localStorage.setItem("listBarang", JSON.stringify(listBarang))
    renderTable()
    hitungStatistik()
}

// fungsi untuk membuat kode barang
function generateCode(itemCode) {
    let listBarang = JSON.parse(localStorage.getItem("listBarang")) || []
    let code = listBarang.length + 1

    if (!itemCode.value.trim()) {
        return `BRG${formatAngka(code)}` //kalau user tidak mengisi code
    } else {
        return itemCode.value.trim() //kalau user mengisi 
    }
}

// fungsi untuk membuat id
function generateID() {
    let ID = Date.now()
    return `${String(ID).slice(9)}`
}


// fungsi format Angka untuk kode barang
function formatAngka(Angka) {
    return String(Angka).padStart(3, '0')
}

// format Harga keRupiah
function formatRupiah(Angka, prefix) {
    let number_string = Angka.toString()
    let split = number_string.split(",")
    let sisa = split[0].length % 3
    let rupiah = split[0].substr(0, sisa)
    let ribuan = split[0].substr(sisa).match(/\d{3}/g)

    // tambahkan titik jika yang di input sudah ribuan
    if (ribuan) {
        let separator = sisa ? '.' : ''
        rupiah += separator + ribuan.join('.')
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah
    return prefix === undefined ? rupiah : (rupiah ? 'Rp ' + rupiah : '')

}
// fungsi update total barang dan nilai inventory
function hitungStatistik() {
    let listBarang = JSON.parse(localStorage.getItem("listBarang")) || []
    let totalBarang = document.getElementById("totalItems")
    let totalInvetaris = document.getElementById("totalValue")
    // jumlah semua total barang
    totalBarang.innerText = listBarang.length

    // jumlah semua total nilai di gudang
    totalInvetaris.innerText = formatRupiah(listBarang.reduce((total, barang) => {
        return total + (barang.harga * barang.stok)
    }, 0), "Rp")

}

// fungsi untuk clear form
function clearForm() {
    document.getElementById("itemName").value = ""
    document.getElementById("itemPrice").value = ""
    document.getElementById("itemStock").value = ""
    document.getElementById("itemCode").value = ""

    // fungsi untuk otomatis keluar dari mode edit setelah update
    if (barangSedangDiedit != null) {
        barangSedangDiedit == null
        dataID = null

        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah Barang'

    }
}
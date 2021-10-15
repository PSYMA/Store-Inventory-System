// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
let host = "http://localhost:44362"

let product_to_delete_id = -1
let product_to_update_id = -1
let product_to_sell_id = -1
let product_to_return_id = -1
let product_quantity_to_sell = -1
let product_to_return_sale_price = -1
let customer_payment = -1;
let customer_change = -1;
let table = null

$(function ($) {
    table = $('#example').DataTable()
    $('#example_length').css({ display: 'none' }) 
    $('#example_paginate').addClass('Pagination float-right')
    //InsertDummyRecords()

    AddProduct()
    SaveProduct()
    GetProductsListTable()
    ConfirmDeleteProduct()
    SellSingleProduct()
    ReturnSingleProduct()
    UpdateProductSingleProduct()
});

function InsertDummyRecords() {
    let min = 20
    let max = 200
    const randomFloat = (min, max) => Math.random() * (max - min) + min;
    for (let i = 0; i < 20; i++) {
        let quantity = Math.floor(Math.random() * 66) + 10;
        let cost_price = randomFloat(min, max)
        let sale_price = randomFloat(min, max)
        CreateProduct(quantity, cost_price, sale_price, "ChocoMucho")
    }
}
function AddProductInputCostPrice(i) {
    let value = $(`#${i}_cost_price_input`).val()
    let percent_profit = 0.30

    if (value <= 0) {
        $(`#${i}_cost_price_input`).val("")
    }
    else {
        let sale_price = parseFloat(value * percent_profit) + parseFloat(value)
        $(`#${i}_sale_price_input`).val(sale_price)
    }
}
function AddProduct() {
    $('#add_product_btn').on("click", () => {
        $('#add_products_tbody').empty()
        for (let i = 0; i < 5; i++) {
            let element = `<tr>
                            <th>
                                ${i + 1}
                            </th>
                            <th>
                                <input class="form-control" type="text" placeholder="Product name" id="${i}_product_name_input"/>
                            </th>
                            <th>
                                <input class="form-control" type="number" placeholder="Cost price" class="text-center" oninput="return AddProductInputCostPrice(${i})" id="${i}_cost_price_input"/>
                            </th>
                            <th>
                                <input class="form-control" type="number" placeholder="Sale price" class="text-center" id="${i}_sale_price_input"/>
                            </th>
                            <th>
                                <input class="form-control" type="number" placeholder="Quantity" class="text-center" id="${i}_quantity_input"/>
                            </th>
                        </tr> `
            $('#add_products_tbody').append(element)
        }
    })
}
function SaveProduct() {
    $('#save_product_btn').on("click", () => {
        for (let i = 0; i < 5; i++) {
            let product_name = $(`#${i}_product_name_input`).val()
            let cost_price = $(`#${i}_cost_price_input`).val()
            let sale_price = $(`#${i}_sale_price_input`).val()
            let quantity = $(`#${i}_quantity_input`).val()

            let save = true
            if (!/\S/.test(product_name) || !/\S/.test(cost_price) || !/\S/.test(sale_price) || !/\S/.test(quantity)) {
                save = false
            }

            if (save) {
                CreateProduct(quantity, cost_price, sale_price, product_name).then((item) => {
                    GetProductsListTable()
                    let new_item = `Product name: ${item.productName}, Cost price: ${item.costPrice}, Sale price: ${item.salePrice}, Quantity: ${item.quantity}, Sold: ${item.sold}`
                    Logging("Added products", `Time: [${new Date().toLocaleString()}] \nItem: [${new_item}]\n`)
                })
            }
        }
     
    })
}
function UpdateProductButton(id) {
    product_to_update_id = id
    $('#update_product_tbody').empty()
    GetProduct(id).then((item) => {
        $('#update_product_modal').modal('show')
        let element = `<tr>
                            <th>${item.id}</th>
                            <th><input type="text" class="form-control" id="update_product_name_input" value="${item.productName}"/></th>
                            <th><input type="text" class="form-control" id="update_cost_price_input" value="${item.costPrice.toFixed(2)}"</th>
                            <th><input type="text" class="form-control" id="update_sale_price_input" value="${item.salePrice.toFixed(2)}"</th>
                            <th><input type="text" class="form-control" id="update_quantity_input" value="${item.quantity}"</th>
                        </tr> `
        $('#update_product_tbody').append(element)
    })
}
function DeleteProductButton(id) {
    product_to_delete_id = id
    $('#confirm_delete_tbody').empty()
    GetProduct(id).then((item) => {
        $('#confirm_delete_product_modal').modal('show')
        let element = `<tr>
                            <th>${item.id}</th>
                            <th>${item.productName}</th>
                            <th>${item.costPrice.toFixed(2)}</th>
                            <th>${item.salePrice.toFixed(2)}</th>
                            <th>${item.quantity}</th>
                        </tr> `
        $('#confirm_delete_tbody').append(element)
    })
    
}
function ReturnProductInputQuantity(e) {
    let quantity = e.target.value
    if (quantity <= 0) {
        $(`#${e.target.id}`).val("")
    }
    else {
        let cashback = (quantity * parseFloat(product_to_return_sale_price)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        $('#return_product_cashback').val(`₱ ${cashback}`)
    }
}
function SellProductInputQuantity(e, quantity) {
    if (e.target.value > quantity || e.target.value <= 0) {
        $(`#${e.target.id}`).val("")
    }
}
function SellProductButton(id) {
    product_to_sell_id = id
    $('#sell_product_tbody').empty()
    GetProduct(id).then((item) => {
        $('#sell_product_modal').modal('show')
        let element = `<tr>
                            <th>${item.id}</th>
                            <th><input disabled type="text" class="form-control" id="sell_product_name_input" value="${item.productName}"/></th>
                            <th><input disabled type="text" class="form-control" id="sell_sale_price_input" value="${item.salePrice.toFixed(2)}"</th>
                            <th><input type="number" class="form-control" placeholder="${item.quantity}" id="sell_quantity_input" oninput="return SellProductInputQuantity(event, ${item.quantity})" value=""</th>
                            <th><input type="number" class="form-control" id="sell_payment_input" value=""</th>
                        </tr> `
        $('#sell_product_tbody').append(element)
    })
}
function ReturnProductButton(id) {
    $('#return_product_tbody').empty()
    GetProduct(id).then((item) => {
        product_to_return_id = id
        product_to_return_sale_price = item.salePrice.toFixed(2)
        $('#return_product_modal').modal('show')
        let element = `<tr>
                            <th>${item.id}</th>
                            <th><input disabled type="text" class="form-control" id="" value="${item.productName}"/></th>
                            <th><input disabled type="text" class="form-control" id="" value="${item.salePrice.toFixed(2)}"</th>
                            <th><input type="number" class="form-control" oninput="return ReturnProductInputQuantity(event)" id="return_product_quantity_input" </th>
                            <th><input disabled type="text" class="form-control" id="return_product_cashback" value=""</th>
                        </tr> `
        $('#return_product_tbody').append(element)
    })
}
function ConfirmDeleteProduct() {
    $('#confirm_delete_product_btn').on("click", () => {
        DeleteProduct(product_to_delete_id).then((item) => {
            GetProductsListTable()
            let new_item = `Product name: ${item.productName}, Cost price: ${item.costPrice}, Sale price: ${item.salePrice}, Quantity: ${item.quantity}, Sold: ${item.sold}`
            Logging("Deleted products", `Time: [${new Date().toLocaleString()}] \nItem: [${new_item}]\n`)
        })
    })
}
function UpdateProductSingleProduct() {
    $('#update_product_btn').on("click", () => {
        let product_name = $('#update_product_name_input').val()
        let cost_price = $('#update_cost_price_input').val()
        let sale_price = $('#update_sale_price_input').val()
        let quantity = $('#update_quantity_input').val()

        let save = true
        if (!/\S/.test(product_name) || !/\S/.test(cost_price) || !/\S/.test(sale_price) || !/\S/.test(quantity)) {
            save = false
        }
        else if (parseFloat(cost_price) > parseFloat(sale_price)) {
            save = false
        }

        if (save) { 
            GetProduct(product_to_update_id).then((item) => {
                let old_item = `Product name: ${item.productName}, Cost price: ${item.costPrice}, Sale price: ${item.salePrice}, Quantity: ${item.quantity}, Sold: ${item.sold}`
                UpdateProduct(product_to_update_id, quantity, cost_price, sale_price, product_name).then((item) => {
                    GetProductsListTable()
                    let new_item = `Product name: ${item.productName}, Cost price: ${item.costPrice}, Sale price: ${item.salePrice}, Quantity: ${item.quantity}, Sold: ${item.sold}`
                    Logging("Updated products", `Time:   [${new Date().toLocaleString()}] \nBefore: [${old_item}] \nAfter:  [${new_item}]\n`)
                })
            })
            
        } 
    })
}
function SellSingleProduct() {
    $('#sell_product_btn').on("click", () => {
        let product_name = $('#sell_product_name_input').val()
        let sale_price = $('#sell_sale_price_input').val()
        let quantity = $('#sell_quantity_input').val()
        let payment = $('#sell_payment_input').val()
        let total = parseFloat(sale_price) * parseInt(quantity)
        let change = parseFloat(payment) - parseFloat(parseFloat(sale_price) * parseInt(quantity))

        $('#product_name_p').text(`Product name: ${product_name}`)
        $('#sale_price_p').text(`Sale price: ₱ ${sale_price}`)
        $('#quantity_p').text(`Quantity: ${quantity}`)
        $('#payment_p').text(`Payment: ₱ ${payment}`)
        $('#total_p').text(`Total: ₱ ${total}`)
        $('#change_p').text(`Change: ₱ ${change}`)

        $('#product_name_p').css({ fontSize: '17px', fontFamily: 'Lucida Console' })
        $('#sale_price_p').css({ fontSize: '17px', fontFamily: 'Lucida Console' })
        $('#quantity_p').css({ fontSize: '17px', fontFamily: 'Lucida Console' })
        $('#payment_p').css({ fontSize: '17px', fontFamily: 'Lucida Console' })
        $('#total_p').css({ fontSize: '17px', fontFamily: 'Lucida Console' })
        $('#change_p').css({ fontSize: '17px', fontFamily: 'Lucida Console' })

        change < 0 ? $('#change_p').css({ color: "red" }) : $('#change_p').css({ color: "black" })
        customer_payment = payment
        customer_change = change
        if (quantity > 0 && payment >= total) {
            $('#confirm_sell_product_btn').prop("disabled", false)
        }
        else {
            $('#confirm_sell_product_btn').prop("disabled", true)
        }

        product_quantity_to_sell = quantity
        $('#confirm_sell_product_modal').modal('show')
    })

    $('#confirm_sell_product_btn').on("click", () => {
        SellProduct(product_to_sell_id, product_quantity_to_sell).then((item) => {
            $('#sell_product_modal').modal('hide')
            GetProductsListTable()
            let new_item = `Product name: ${item.productName}, Cost price: ${item.costPrice}, Sale price: ${item.salePrice}, Quantity: ${item.quantity}, Sold: ${item.sold}, [Bought: ${product_quantity_to_sell} Payment: ${customer_payment}: Change: ${customer_change}]`
            Logging("Sold products", `Time: [${new Date().toLocaleString()}] \nItem: [${new_item}]\n`)
        })
    })
}
function ReturnSingleProduct() {
    $('#return_product_btn').on("click", () => {
        let quantity = $('#return_product_quantity_input').val() 
        GetProduct(product_to_return_id).then((item) => { 
            let old_item = `Product name: ${item.productName}, Cost price: ${item.costPrice}, Sale price: ${item.salePrice}, Quantity: ${item.quantity}, Sold: ${item.sold}`
            ReturnProduct(product_to_return_id, quantity).then((item) => {
                GetProductsListTable()
                let new_item = `Product name: ${item.productName}, Cost price: ${item.costPrice}, Sale price: ${item.salePrice}, Quantity: ${item.quantity}, Sold: ${item.sold}`
                Logging("Returned products", `Time:   [${new Date().toLocaleString()}] \nBefore: [${old_item}] \nAfter:  [${new_item}]\n`)
            })
        })
        
    }) 
}
function GetProductsListTable() { 
    table.clear().draw(false)

    GetProducts().then((products) => {
        let total_profit = 0
        for (let i = 0; i < products.length; i++) {
            let id = products[i].id
            let sold = products[i].sold 
            let quantity = products[i].quantity
            let cost_price = products[i].costPrice
            let sale_price = products[i].salePrice
            let product_name = products[i].productName
            let profit = sold != 0 ? (parseFloat(sold) * parseFloat(sale_price)) : 0

            disabled_sell_btn = quantity == 0 ? "disabled" : ""
            disabled_return_btn = sold == 0 ? "disabled" : ""
            disabled_update_btn = sold != 0 ? "disabled" : ""
            total_profit += profit
            table.row.add([
                id,
                product_name,
                `₱ ${cost_price.toFixed(2)}`.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                `₱ ${sale_price.toFixed(2)}`.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                quantity,
                sold,
                `₱ ${profit.toFixed(2)}`.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                ` <button ${disabled_update_btn} class="btn btn-outline-primary button-rad-50" data-toggle="tooltip" data-placement="bottom" title="Update product"
                    onclick="return UpdateProductButton(${id})">
                  U
                  </button>
                  <button class="btn btn-outline-danger button-rad-50" data-toggle="tooltip" data-placement="bottom" title="Delete product"
                    onclick="return DeleteProductButton(${id})">
                  D
                  </button>
                  <button ${disabled_return_btn} class="btn btn-outline-warning button-rad-50" data-toggle="tooltip" data-placement="bottom" title="Return product"
                    onclick="return ReturnProductButton(${id})">
                  R
                  </button>
                  <button ${disabled_sell_btn} class="btn btn-outline-success button-rad-50" data-toggle="tooltip" data-placement="bottom" title="Sell product"
                    onclick="return SellProductButton(${id})">
                  S
                  </button>`,
            ]).draw(false); 
        }
        $('#total_profit').text(`₱${total_profit.toFixed(2)}`.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
    }); 
}

async function CreateProduct(quantity, cost_price, sale_price, product_name) {
    const data = {
        'Quantity': quantity.toString(),
        'CostPrice': parseFloat(cost_price).toFixed(2).toString(),
        'SalePrice': parseFloat(sale_price).toFixed(2).toString(),
        'ProductName': product_name.toString()
    }

    let url = host + `/api/CreateProduct?product`
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return await response.json(); 
}
async function UpdateProduct(id, quantity, cost_price, sale_price, product_name) { 
    const data = {
        'Id': id.toString(),
        'Quantity': quantity.toString(),
        'CostPrice': cost_price.toString(),
        'SalePrice': sale_price.toString(),
        'ProductName': product_name.toString()
    }

    let url = host + `/api/UpdateProduct?product`
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return await response.json(); 
}
async function SellProduct(id, quantity) {
    const data = {
        'Id': id.toString(),
        'Quantity': quantity.toString()
    }

    let url = host + `/api/SellProduct?product`
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return await response.json();
}
async function ReturnProduct(id, quantity) {
    const data = {
        'Id': id.toString(),
        'Quantity': quantity.toString()
    }

    let url = host + `/api/ReturnProduct?product`
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return await response.json();
}
async function GetProducts() {
    let url = host + `/api/GetProducts`
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    return await response.json();
}
async function GetProduct(id) {
    let url = host + `/api/GetProduct?id=` + id
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    return await response.json(); 
}
async function DeleteProduct(id) {
    let url = host + `/api/DeleteProduct?id=` + id
    let response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    return await response.json();
}
async function Logging(action, msg) {
    const data = {
        "Action": action.toString(),
        "Message": msg.toString()
    }

    let url = host + `/api/Logging?logs`
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return await response.json();
}






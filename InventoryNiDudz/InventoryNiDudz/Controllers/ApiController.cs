using InventoryNiDudz.Models;
using InventoryNiDudz.Repository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace InventoryNiDudz.Controllers {
    public class ApiController : ControllerBase {
        private readonly IProductRepository _productRepository;
        public ApiController(IProductRepository productRepository) {
            _productRepository = productRepository;
        }

        [HttpPost]
        [Route("[controller]/CreateProduct")]
        [Produces("application/json")]
        public async Task<IActionResult> CreateProduct([FromBody] object product) {
            var json_map = JsonSerializer.Deserialize<Dictionary<string, string>>(product.ToString());

            int quantity = int.Parse(json_map["Quantity"]);
            float cost_price = float.Parse(json_map["CostPrice"]);
            float sale_price = float.Parse(json_map["SalePrice"]);
            string product_name = json_map["ProductName"];

            return Ok(await _productRepository.Create( new ProductModels { 
                Quantity = quantity,
                CostPrice = cost_price,
                SalePrice = sale_price,
                ProductName  = product_name
            }));
        }

        [HttpPost]
        [Route("[controller]/UpdateProduct")]
        [Produces("application/json")]
        public async Task<IActionResult> UpdateProduct([FromBody] object product) {
            var json_map = JsonSerializer.Deserialize<Dictionary<string, string>>(product.ToString());

            var id = int.Parse(json_map["Id"]);
            int quantity = int.Parse(json_map["Quantity"]);
            float cost_price = float.Parse(json_map["CostPrice"]);
            float sale_price = float.Parse(json_map["SalePrice"]);
            string product_name = json_map["ProductName"];

            var update_product = await _productRepository.Get(id);
            
            if(update_product != null) {
                update_product.Quantity = quantity;
                update_product.CostPrice = cost_price;
                update_product.SalePrice = sale_price;
                update_product.ProductName = product_name;

                await _productRepository.Update(update_product);
                return Ok(update_product);
            }

            return Ok("Update failed!");
        }

        [HttpPost]
        [Route("[controller]/SellProduct")]
        [Produces("application/json")]
        public async Task<IActionResult> SellProduct([FromBody] object product) {
            var json_map = JsonSerializer.Deserialize<Dictionary<string, string>>(product.ToString());

            var id = int.Parse(json_map["Id"]);
            int quantity = int.Parse(json_map["Quantity"]);

            var update_product = await _productRepository.Get(id);

            if (update_product != null) {
                update_product.Quantity -= quantity;
                update_product.Sold += quantity;

                await _productRepository.Update(update_product);
                return Ok(update_product);
            }

            return Ok("Sell failed!");
        }

        [HttpPost]
        [Route("[controller]/ReturnProduct")]
        [Produces("application/json")]
        public async Task<IActionResult> ReturnProduct([FromBody] object product) {
            var json_map = JsonSerializer.Deserialize<Dictionary<string, string>>(product.ToString());

            var id = int.Parse(json_map["Id"]);
            int quantity = int.Parse(json_map["Quantity"]);

            var update_product = await _productRepository.Get(id);

            if (update_product != null) {
                update_product.Quantity += quantity;
                update_product.Sold -= quantity;

                await _productRepository.Update(update_product);
                return Ok(update_product);
            }

            return Ok("Return failed!");
        }

        [HttpDelete]
        [Route("[controller]/DeleteProduct")]
        [Produces("application/json")]
        public async Task<IActionResult> DeleteProduct(int id) {
            var delete_product = await _productRepository.Get(id);  
            if (delete_product != null) {
                await _productRepository.Delete(delete_product.Id);
                return Ok(delete_product);
            }

            return Ok("No deletion!");
        }

        [HttpGet]
        [Route("[controller]/GetProduct")]
        [Produces("application/json")]
        public async Task<IActionResult> GetProduct(int id) { 
            return Ok(await _productRepository.Get(id));
        }

        [HttpGet]
        [Route("[controller]/GetProducts")]
        [Produces("application/json")]
        public async Task<IActionResult> GetProducts() {  
            return Ok(await _productRepository.Get());
        }

        [HttpPost]
        [Route("[controller]/Logging")]
        [Produces("application/json")]
        public async Task<IActionResult> Logging([FromBody] object logs) {
            var json_map = JsonSerializer.Deserialize<Dictionary<string, string>>(logs.ToString());

            var action = json_map["Action"];
            var msg = json_map["Message"];

            var dir = Directory.GetCurrentDirectory() + "\\" + action;
            Directory.CreateDirectory(dir);

            using(var sw = new StreamWriter(dir + $"\\{DateTime.Now.ToLongDateString()}.txt", true)) {
                sw.WriteLine(msg);
            }


            return Ok(await Task.FromResult("Logs updated!"));
        }
    }
}

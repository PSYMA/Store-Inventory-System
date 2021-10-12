using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryNiDudz.Models {
    public class ProductModels {
        [Key]
        public int Id { get; set; }
        public int Sold { get; set; }
        public int Quantity { get; set; }
        public float CostPrice { get; set; }
        public float SalePrice { get; set; }
        public string ProductName { get; set; }
    }
}

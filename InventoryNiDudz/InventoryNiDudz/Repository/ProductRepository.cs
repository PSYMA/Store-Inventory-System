using InventoryNiDudz.Context;
using InventoryNiDudz.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryNiDudz.Repository {
    public class ProductRepository : IProductRepository {
        private readonly DataContext context;

        public ProductRepository(DataContext context) {
            this.context = context;
        }
        public async Task<ProductModels> Create(ProductModels product) {
            this.context.Products.Add(product);
            await context.SaveChangesAsync();

            return product;
        }

        public async Task Delete(int id) {
            var product_to_delete = await this.context.Products.FindAsync(id); 
            this.context.Products.Remove(product_to_delete);

            await context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ProductModels>> Get() {
            return await this.context.Products.ToListAsync();
        }

        public async Task<ProductModels> Get(int id) {
            return await this.context.Products.FindAsync(id);
        }

        public async Task Update(ProductModels product) {
            this.context.Entry(product).State = EntityState.Modified;
            await this.context.SaveChangesAsync();
        }
    }
}

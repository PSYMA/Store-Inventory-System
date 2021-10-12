using InventoryNiDudz.Models;
using Microsoft.EntityFrameworkCore; 

namespace InventoryNiDudz.Context {
    public class DataContext : DbContext {
        public DataContext(DbContextOptions<DataContext> options) : base(options) {
            Database.EnsureCreated();
        }

        public DbSet<ProductModels> Products { get; set; } 
    }
}

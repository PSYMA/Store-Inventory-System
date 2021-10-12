using InventoryNiDudz.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryNiDudz.Repository {
    public interface IProductRepository {
        Task<IEnumerable<ProductModels>> Get();
        Task<ProductModels> Get(int id);
        Task<ProductModels> Create(ProductModels product);
        Task Delete(int id);
        Task Update(ProductModels product);
    }
}

import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';
import { requestLogger } from '../middleware/requestLogger';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateUpdateStock,
  validateProductFilters,
  validatePagination,
  validateUUID
} from '../middleware/validation';

const router = Router();

// Aplicar middleware de autenticação e logging em todas as rotas
router.use(authenticateToken);
router.use(requestLogger);

// Rotas para produtos

// POST /api/products - Criar produto
router.post('/', validateCreateProduct, ProductController.create);

// GET /api/products - Listar produtos com filtros e paginação
router.get('/', validateProductFilters, validatePagination, ProductController.findAll);

// GET /api/products/low-stock - Buscar produtos com estoque baixo
router.get('/low-stock', ProductController.findLowStock);

// GET /api/products/categories - Buscar categorias de produtos
router.get('/categories', ProductController.getCategories);

// GET /api/products/barcode/:barcode - Buscar produto por código de barras
router.get('/barcode/:barcode', ProductController.findByBarcode);

// GET /api/products/supplier/:supplierId - Buscar produtos por fornecedor
router.get('/supplier/:supplierId', 
  validateUUID('supplierId'), 
  validatePagination, 
  ProductController.findBySupplier
);

// GET /api/products/category/:category - Buscar produtos por categoria
router.get('/category/:category', 
  validatePagination, 
  ProductController.findByCategory
);

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', validateUUID(), ProductController.findById);

// GET /api/products/:id/details - Buscar produto por ID com detalhes
router.get('/:id/details', validateUUID(), ProductController.findByIdWithDetails);

// PUT /api/products/:id - Atualizar produto
router.put('/:id', validateUUID(), validateUpdateProduct, ProductController.update);

// PATCH /api/products/:id/stock - Atualizar estoque do produto
router.patch('/:id/stock', validateUUID(), validateUpdateStock, ProductController.updateStock);

// PATCH /api/products/:id/toggle-active - Ativar/Desativar produto
router.patch('/:id/toggle-active', validateUUID(), ProductController.toggleActive);

// DELETE /api/products/:id - Deletar produto
router.delete('/:id', validateUUID(), ProductController.delete);

export default router;

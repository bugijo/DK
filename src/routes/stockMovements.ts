import { Router } from 'express';
import { StockMovementController } from '../controllers/stockMovementController';
import { authenticateToken } from '../middleware/auth';
import { requestLogger } from '../middleware/requestLogger';
import {
  validateCreateStockMovement,
  validateCreateInternalUse,
  validateCreateSale,
  validateCreateEntry,
  validateStockMovementFilters,
  validatePagination,
  validateUUID
} from '../middleware/validation';

const router = Router();

// Aplicar middleware de autenticação e logging em todas as rotas
router.use(authenticateToken);
router.use(requestLogger);

// Rotas para movimentações de estoque

// POST /api/stock-movements - Criar movimentação de estoque
router.post('/', validateCreateStockMovement, StockMovementController.create);

// POST /api/stock-movements/internal-use - Criar movimentação de uso interno
router.post('/internal-use', validateCreateInternalUse, StockMovementController.createInternalUse);

// POST /api/stock-movements/sale - Criar movimentação de venda
router.post('/sale', validateCreateSale, StockMovementController.createSale);

// POST /api/stock-movements/entry - Criar movimentação de entrada
router.post('/entry', validateCreateEntry, StockMovementController.createEntry);

// GET /api/stock-movements - Listar movimentações com filtros e paginação
router.get('/', validateStockMovementFilters, validatePagination, StockMovementController.findAll);

// GET /api/stock-movements/types - Buscar tipos de movimentação disponíveis
router.get('/types', StockMovementController.getMovementTypes);

// GET /api/stock-movements/summary - Obter resumo de movimentações
router.get('/summary', validateStockMovementFilters, StockMovementController.getSummary);

// GET /api/stock-movements/product/:productId - Buscar movimentações por produto
router.get('/product/:productId', 
  validateUUID('productId'), 
  validatePagination, 
  StockMovementController.findByProductId
);

// GET /api/stock-movements/type/:type - Buscar movimentações por tipo
router.get('/type/:type', 
  validatePagination, 
  StockMovementController.findByType
);

// GET /api/stock-movements/date-range - Buscar movimentações por período
router.get('/date-range', 
  validateStockMovementFilters, 
  validatePagination, 
  StockMovementController.findByDateRange
);

// GET /api/stock-movements/:id - Buscar movimentação por ID
router.get('/:id', validateUUID(), StockMovementController.findById);

// GET /api/stock-movements/:id/details - Buscar movimentação por ID com detalhes
router.get('/:id/details', validateUUID(), StockMovementController.findByIdWithDetails);

// DELETE /api/stock-movements/:id - Deletar movimentação
router.delete('/:id', validateUUID(), StockMovementController.delete);

export default router;

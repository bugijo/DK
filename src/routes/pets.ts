import { Router } from 'express';
import {
  createPet,
  getPetById,
  getPets,
  updatePet,
  deletePet,
  getPetByMicrochip,
  getPetsByClient,
  getPetsBySpecies,
  countPets,
} from '../controllers/petController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createPetSchema, updatePetSchema } from '../middleware/validation';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @route POST /api/pets
 * @desc Criar novo pet
 * @access Private (Admin, Vet, Assistant)
 */
router.post('/', 
  requireRole(['admin', 'vet', 'assistant']), 
  validateRequest(createPetSchema), 
  createPet
);

/**
 * @route GET /api/pets
 * @desc Listar pets com paginação e filtros
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/', requireRole(['admin', 'vet', 'assistant']), getPets);

/**
 * @route GET /api/pets/count
 * @desc Contar pets
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/count', requireRole(['admin', 'vet', 'assistant']), countPets);

/**
 * @route GET /api/pets/microchip/:microchip
 * @desc Buscar pet por microchip
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/microchip/:microchip', requireRole(['admin', 'vet', 'assistant']), getPetByMicrochip);

/**
 * @route GET /api/pets/client/:clientId
 * @desc Buscar pets por cliente
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/client/:clientId', requireRole(['admin', 'vet', 'assistant']), getPetsByClient);

/**
 * @route GET /api/pets/species/:species
 * @desc Buscar pets por espécie
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/species/:species', requireRole(['admin', 'vet', 'assistant']), getPetsBySpecies);

/**
 * @route GET /api/pets/:id
 * @desc Obter pet por ID
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/:id', requireRole(['admin', 'vet', 'assistant']), getPetById);

/**
 * @route PUT /api/pets/:id
 * @desc Atualizar pet
 * @access Private (Admin, Vet, Assistant)
 */
router.put('/:id', 
  requireRole(['admin', 'vet', 'assistant']), 
  validateRequest(updatePetSchema), 
  updatePet
);

/**
 * @route DELETE /api/pets/:id
 * @desc Deletar pet
 * @access Private (Admin only)
 */
router.delete('/:id', requireRole(['admin']), deletePet);

export default router;
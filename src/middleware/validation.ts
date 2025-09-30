import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

// Schemas de validação para Client
export const createClientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email deve ter um formato válido'
  }),
  phone: Joi.string().pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/).optional().messages({
    'string.pattern.base': 'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
  }),
  address: Joi.string().max(200).optional().messages({
    'string.max': 'Endereço deve ter no máximo 200 caracteres'
  }),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional().messages({
    'string.pattern.base': 'CPF deve ter o formato XXX.XXX.XXX-XX'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  })
});

export const updateClientSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email deve ter um formato válido'
  }),
  phone: Joi.string().pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/).optional().messages({
    'string.pattern.base': 'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
  }),
  address: Joi.string().max(200).optional().messages({
    'string.max': 'Endereço deve ter no máximo 200 caracteres'
  }),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional().messages({
    'string.pattern.base': 'CPF deve ter o formato XXX.XXX.XXX-XX'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  }),
  is_active: Joi.boolean().optional()
});

// Schemas de validação para Pet
export const createPetSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome deve ter no máximo 50 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other').required().messages({
    'any.only': 'Espécie deve ser: dog, cat, bird, rabbit ou other',
    'any.required': 'Espécie é obrigatória'
  }),
  breed: Joi.string().max(50).optional().messages({
    'string.max': 'Raça deve ter no máximo 50 caracteres'
  }),
  gender: Joi.string().valid('male', 'female').optional().messages({
    'any.only': 'Sexo deve ser: male ou female'
  }),
  birth_date: Joi.date().iso().max('now').optional().messages({
    'date.max': 'Data de nascimento não pode ser no futuro'
  }),
  weight: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Peso deve ser um número positivo'
  }),
  color: Joi.string().max(30).optional().messages({
    'string.max': 'Cor deve ter no máximo 30 caracteres'
  }),
  microchip: Joi.string().max(20).optional().messages({
    'string.max': 'Microchip deve ter no máximo 20 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  }),
  client_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do cliente deve ser um UUID válido',
    'any.required': 'ID do cliente é obrigatório'
  })
});

export const updatePetSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional().messages({
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome deve ter no máximo 50 caracteres'
  }),
  species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other').optional().messages({
    'any.only': 'Espécie deve ser: dog, cat, bird, rabbit ou other'
  }),
  breed: Joi.string().max(50).optional().messages({
    'string.max': 'Raça deve ter no máximo 50 caracteres'
  }),
  gender: Joi.string().valid('male', 'female').optional().messages({
    'any.only': 'Sexo deve ser: male ou female'
  }),
  birth_date: Joi.date().iso().max('now').optional().messages({
    'date.max': 'Data de nascimento não pode ser no futuro'
  }),
  weight: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Peso deve ser um número positivo'
  }),
  color: Joi.string().max(30).optional().messages({
    'string.max': 'Cor deve ter no máximo 30 caracteres'
  }),
  microchip: Joi.string().max(20).optional().messages({
    'string.max': 'Microchip deve ter no máximo 20 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  }),
  is_active: Joi.boolean().optional()
});

// Schemas de validação para User
export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  }),
  role: Joi.string().valid('admin', 'veterinarian', 'assistant', 'receptionist').required().messages({
    'any.only': 'Papel deve ser: admin, veterinarian, assistant ou receptionist',
    'any.required': 'Papel é obrigatório'
  }),
  phone: Joi.string().pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/).optional().messages({
    'string.pattern.base': 'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
  }),
  crmv: Joi.string().max(20).optional().messages({
    'string.max': 'CRMV deve ter no máximo 20 caracteres'
  })
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email deve ter um formato válido'
  }),
  role: Joi.string().valid('admin', 'veterinarian', 'assistant', 'receptionist').optional().messages({
    'any.only': 'Papel deve ser: admin, veterinarian, assistant ou receptionist'
  }),
  phone: Joi.string().pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/).optional().messages({
    'string.pattern.base': 'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
  }),
  crmv: Joi.string().max(20).optional().messages({
    'string.max': 'CRMV deve ter no máximo 20 caracteres'
  }),
  is_active: Joi.boolean().optional()
});

// Schemas de validação para Supplier
export const createSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional().messages({
    'string.pattern.base': 'CNPJ deve ter o formato XX.XXX.XXX/XXXX-XX'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email deve ter um formato válido'
  }),
  phone: Joi.string().pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/).optional().messages({
    'string.pattern.base': 'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
  }),
  address: Joi.string().max(200).optional().messages({
    'string.max': 'Endereço deve ter no máximo 200 caracteres'
  }),
  contact_person: Joi.string().max(100).optional().messages({
    'string.max': 'Pessoa de contato deve ter no máximo 100 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  })
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional().messages({
    'string.pattern.base': 'CNPJ deve ter o formato XX.XXX.XXX/XXXX-XX'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email deve ter um formato válido'
  }),
  phone: Joi.string().pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/).optional().messages({
    'string.pattern.base': 'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
  }),
  address: Joi.string().max(200).optional().messages({
    'string.max': 'Endereço deve ter no máximo 200 caracteres'
  }),
  contact_person: Joi.string().max(100).optional().messages({
    'string.max': 'Pessoa de contato deve ter no máximo 100 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  }),
  is_active: Joi.boolean().optional()
});

// Schemas de validação para AccountsPayable
export const createAccountsPayableSchema = Joi.object({
  supplier_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do fornecedor deve ser um UUID válido',
    'any.required': 'ID do fornecedor é obrigatório'
  }),
  description: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Descrição deve ter pelo menos 1 caractere',
    'string.max': 'Descrição deve ter no máximo 200 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Valor deve ser um número positivo',
    'any.required': 'Valor é obrigatório'
  }),
  due_date: Joi.date().iso().min('now').required().messages({
    'date.min': 'Data de vencimento deve ser hoje ou no futuro',
    'any.required': 'Data de vencimento é obrigatória'
  }),
  category: Joi.string().max(50).optional().messages({
    'string.max': 'Categoria deve ter no máximo 50 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  })
});

export const updateAccountsPayableSchema = Joi.object({
  description: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'Descrição deve ter pelo menos 1 caractere',
    'string.max': 'Descrição deve ter no máximo 200 caracteres'
  }),
  amount: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Valor deve ser um número positivo'
  }),
  due_date: Joi.date().iso().optional(),
  category: Joi.string().max(50).optional().messages({
    'string.max': 'Categoria deve ter no máximo 50 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  }),
  status: Joi.string().valid('pending', 'paid', 'overdue', 'cancelled').optional().messages({
    'any.only': 'Status deve ser: pending, paid, overdue ou cancelled'
  })
});

// Schemas de validação para AccountsReceivable
export const createAccountsReceivableSchema = Joi.object({
  client_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do cliente deve ser um UUID válido',
    'any.required': 'ID do cliente é obrigatório'
  }),
  description: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Descrição deve ter pelo menos 1 caractere',
    'string.max': 'Descrição deve ter no máximo 200 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Valor deve ser um número positivo',
    'any.required': 'Valor é obrigatório'
  }),
  due_date: Joi.date().iso().min('now').required().messages({
    'date.min': 'Data de vencimento deve ser hoje ou no futuro',
    'any.required': 'Data de vencimento é obrigatória'
  }),
  service_date: Joi.date().iso().max('now').optional().messages({
    'date.max': 'Data do serviço não pode ser no futuro'
  }),
  category: Joi.string().max(50).optional().messages({
    'string.max': 'Categoria deve ter no máximo 50 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  })
});

export const updateAccountsReceivableSchema = Joi.object({
  description: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'Descrição deve ter pelo menos 1 caractere',
    'string.max': 'Descrição deve ter no máximo 200 caracteres'
  }),
  amount: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Valor deve ser um número positivo'
  }),
  due_date: Joi.date().iso().optional(),
  service_date: Joi.date().iso().max('now').optional().messages({
    'date.max': 'Data do serviço não pode ser no futuro'
  }),
  category: Joi.string().max(50).optional().messages({
    'string.max': 'Categoria deve ter no máximo 50 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  }),
  status: Joi.string().valid('pending', 'paid', 'overdue', 'cancelled').optional().messages({
    'any.only': 'Status deve ser: pending, paid, overdue ou cancelled'
  })
});

// Schemas de validação para Appointment
export const createAppointmentSchema = Joi.object({
  pet_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do pet deve ser um UUID válido',
    'any.required': 'ID do pet é obrigatório'
  }),
  veterinarian_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do veterinário deve ser um UUID válido',
    'any.required': 'ID do veterinário é obrigatório'
  }),
  appointment_date: Joi.date().iso().min('now').required().messages({
    'date.min': 'Data do agendamento deve ser no futuro',
    'any.required': 'Data do agendamento é obrigatória'
  }),
  reason: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Motivo deve ter pelo menos 1 caractere',
    'string.max': 'Motivo deve ter no máximo 200 caracteres',
    'any.required': 'Motivo é obrigatório'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  })
});

export const updateAppointmentSchema = Joi.object({
  appointment_date: Joi.date().iso().optional(),
  reason: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'Motivo deve ter pelo menos 1 caractere',
    'string.max': 'Motivo deve ter no máximo 200 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Observações devem ter no máximo 500 caracteres'
  }),
  status: Joi.string().valid('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show').optional().messages({
    'any.only': 'Status deve ser: scheduled, confirmed, in_progress, completed, cancelled ou no_show'
  })
});

// Schemas de validação para MedicalRecord
export const createMedicalRecordSchema = Joi.object({
  appointment_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do agendamento deve ser um UUID válido',
    'any.required': 'ID do agendamento é obrigatório'
  }),
  pet_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do pet deve ser um UUID válido',
    'any.required': 'ID do pet é obrigatório'
  }),
  veterinarian_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do veterinário deve ser um UUID válido',
    'any.required': 'ID do veterinário é obrigatório'
  }),
  symptoms: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Sintomas devem ter pelo menos 1 caractere',
    'string.max': 'Sintomas devem ter no máximo 1000 caracteres',
    'any.required': 'Sintomas são obrigatórios'
  }),
  diagnosis: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Diagnóstico deve ter pelo menos 1 caractere',
    'string.max': 'Diagnóstico deve ter no máximo 1000 caracteres',
    'any.required': 'Diagnóstico é obrigatório'
  }),
  treatment: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Tratamento deve ter pelo menos 1 caractere',
    'string.max': 'Tratamento deve ter no máximo 1000 caracteres',
    'any.required': 'Tratamento é obrigatório'
  }),
  medications: Joi.string().max(1000).optional().messages({
    'string.max': 'Medicamentos devem ter no máximo 1000 caracteres'
  }),
  next_visit: Joi.date().iso().min('now').optional().messages({
    'date.min': 'Próxima visita deve ser no futuro'
  }),
  weight: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Peso deve ser um número positivo'
  }),
  temperature: Joi.number().min(30).max(45).precision(1).optional().messages({
    'number.min': 'Temperatura deve ser pelo menos 30°C',
    'number.max': 'Temperatura deve ser no máximo 45°C'
  }),
  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações devem ter no máximo 1000 caracteres'
  })
});

export const updateMedicalRecordSchema = Joi.object({
  symptoms: Joi.string().min(1).max(1000).optional().messages({
    'string.min': 'Sintomas devem ter pelo menos 1 caractere',
    'string.max': 'Sintomas devem ter no máximo 1000 caracteres'
  }),
  diagnosis: Joi.string().min(1).max(1000).optional().messages({
    'string.min': 'Diagnóstico deve ter pelo menos 1 caractere',
    'string.max': 'Diagnóstico deve ter no máximo 1000 caracteres'
  }),
  treatment: Joi.string().min(1).max(1000).optional().messages({
    'string.min': 'Tratamento deve ter pelo menos 1 caractere',
    'string.max': 'Tratamento deve ter no máximo 1000 caracteres'
  }),
  medications: Joi.string().max(1000).optional().messages({
    'string.max': 'Medicamentos devem ter no máximo 1000 caracteres'
  }),
  next_visit: Joi.date().iso().optional(),
  weight: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Peso deve ser um número positivo'
  }),
  temperature: Joi.number().min(30).max(45).precision(1).optional().messages({
    'number.min': 'Temperatura deve ser pelo menos 30°C',
    'number.max': 'Temperatura deve ser no máximo 45°C'
  }),
  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações devem ter no máximo 1000 caracteres'
  })
});

// Schemas de validação para Product
export const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres'
  }),
  cost_price: Joi.number().min(0).precision(2).required().messages({
    'number.min': 'Preço de custo deve ser maior ou igual a zero',
    'any.required': 'Preço de custo é obrigatório'
  }),
  sale_price: Joi.number().min(0).precision(2).required().messages({
    'number.min': 'Preço de venda deve ser maior ou igual a zero',
    'any.required': 'Preço de venda é obrigatório'
  }),
  current_stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Estoque atual deve ser maior ou igual a zero',
    'any.required': 'Estoque atual é obrigatório'
  }),
  min_stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Estoque mínimo deve ser maior ou igual a zero',
    'any.required': 'Estoque mínimo é obrigatório'
  }),
  supplier_id: Joi.string().uuid().optional().messages({
    'string.uuid': 'ID do fornecedor deve ser um UUID válido'
  }),
  category: Joi.string().max(50).optional().messages({
    'string.max': 'Categoria deve ter no máximo 50 caracteres'
  }),
  unit: Joi.string().max(20).optional().messages({
    'string.max': 'Unidade deve ter no máximo 20 caracteres'
  }),
  barcode: Joi.string().max(50).optional().messages({
    'string.max': 'Código de barras deve ter no máximo 50 caracteres'
  }),
  is_active: Joi.boolean().optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres'
  }),
  cost_price: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Preço de custo deve ser maior ou igual a zero'
  }),
  sale_price: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Preço de venda deve ser maior ou igual a zero'
  }),
  min_stock: Joi.number().integer().min(0).optional().messages({
    'number.min': 'Estoque mínimo deve ser maior ou igual a zero'
  }),
  supplier_id: Joi.string().uuid().optional().messages({
    'string.uuid': 'ID do fornecedor deve ser um UUID válido'
  }),
  category: Joi.string().max(50).optional().messages({
    'string.max': 'Categoria deve ter no máximo 50 caracteres'
  }),
  unit: Joi.string().max(20).optional().messages({
    'string.max': 'Unidade deve ter no máximo 20 caracteres'
  }),
  barcode: Joi.string().max(50).optional().messages({
    'string.max': 'Código de barras deve ter no máximo 50 caracteres'
  }),
  is_active: Joi.boolean().optional()
});

export const updateStockSchema = Joi.object({
  current_stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Estoque atual deve ser maior ou igual a zero',
    'any.required': 'Estoque atual é obrigatório'
  })
});

// Schemas de validação para StockMovement
export const createStockMovementSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do produto deve ser um UUID válido',
    'any.required': 'ID do produto é obrigatório'
  }),
  type: Joi.string().valid('entry', 'sale', 'adjustment', 'internal_use').required().messages({
    'any.only': 'Tipo deve ser: entry, sale, adjustment ou internal_use',
    'any.required': 'Tipo é obrigatório'
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantidade deve ser um número positivo',
    'any.required': 'Quantidade é obrigatória'
  }),
  unit_cost: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Custo unitário deve ser maior ou igual a zero'
  }),
  unit_price: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Preço unitário deve ser maior ou igual a zero'
  }),
  reason: Joi.string().max(200).optional().messages({
    'string.max': 'Motivo deve ter no máximo 200 caracteres'
  }),
  related_to: Joi.object().optional()
});

export const createInternalUseSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do produto deve ser um UUID válido',
    'any.required': 'ID do produto é obrigatório'
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantidade deve ser um número positivo',
    'any.required': 'Quantidade é obrigatória'
  }),
  reason: Joi.string().max(200).optional().messages({
    'string.max': 'Motivo deve ter no máximo 200 caracteres'
  }),
  related_to: Joi.object().optional()
});

export const createSaleSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do produto deve ser um UUID válido',
    'any.required': 'ID do produto é obrigatório'
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantidade deve ser um número positivo',
    'any.required': 'Quantidade é obrigatória'
  }),
  unit_price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Preço unitário deve ser um número positivo',
    'any.required': 'Preço unitário é obrigatório'
  }),
  related_to: Joi.object().optional()
});

export const createEntrySchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do produto deve ser um UUID válido',
    'any.required': 'ID do produto é obrigatório'
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantidade deve ser um número positivo',
    'any.required': 'Quantidade é obrigatória'
  }),
  unit_cost: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Custo unitário deve ser maior ou igual a zero'
  }),
  reason: Joi.string().max(200).optional().messages({
    'string.max': 'Motivo deve ter no máximo 200 caracteres'
  }),
  related_to: Joi.object().optional()
});

// Schemas de filtros
export const appointmentFiltersSchema = Joi.object({
  pet_id: Joi.string().uuid().optional(),
  veterinarian_id: Joi.string().uuid().optional(),
  client_id: Joi.string().uuid().optional(),
  status: Joi.string().valid('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show').optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional()
});

export const medicalRecordFiltersSchema = Joi.object({
  pet_id: Joi.string().uuid().optional(),
  veterinarian_id: Joi.string().uuid().optional(),
  client_id: Joi.string().uuid().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  diagnosis: Joi.string().optional()
});

export const productFiltersSchema = Joi.object({
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  supplier_id: Joi.string().uuid().optional(),
  low_stock: Joi.boolean().optional(),
  is_active: Joi.boolean().optional(),
  barcode: Joi.string().optional()
});

export const stockMovementFiltersSchema = Joi.object({
  product_id: Joi.string().uuid().optional(),
  type: Joi.string().valid('entry', 'sale', 'adjustment', 'internal_use').optional(),
  user_id: Joi.string().uuid().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  reason: Joi.string().optional()
});

// Schema de paginação
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// Middlewares de validação
export const validateCreateClient = validateData(createClientSchema);
export const validateUpdateClient = validateData(updateClientSchema);
export const validateCreatePet = validateData(createPetSchema);
export const validateUpdatePet = validateData(updatePetSchema);
export const validateCreateUser = validateData(createUserSchema);
export const validateUpdateUser = validateData(updateUserSchema);
export const validateCreateSupplier = validateData(createSupplierSchema);
export const validateUpdateSupplier = validateData(updateSupplierSchema);
export const validateCreateAccountsPayable = validateData(createAccountsPayableSchema);
export const validateUpdateAccountsPayable = validateData(updateAccountsPayableSchema);
export const validateCreateAccountsReceivable = validateData(createAccountsReceivableSchema);
export const validateUpdateAccountsReceivable = validateData(updateAccountsReceivableSchema);
export const validateCreateAppointment = validateData(createAppointmentSchema);
export const validateUpdateAppointment = validateData(updateAppointmentSchema);
export const validateCreateMedicalRecord = validateData(createMedicalRecordSchema);
export const validateUpdateMedicalRecord = validateData(updateMedicalRecordSchema);
export const validateCreateProduct = validateData(createProductSchema);
export const validateUpdateProduct = validateData(updateProductSchema);
export const validateUpdateStock = validateData(updateStockSchema);
export const validateCreateStockMovement = validateData(createStockMovementSchema);
export const validateCreateInternalUse = validateData(createInternalUseSchema);
export const validateCreateSale = validateData(createSaleSchema);
export const validateCreateEntry = validateData(createEntrySchema);
export const validateAppointmentFilters = validateData(appointmentFiltersSchema, 'query');
export const validateMedicalRecordFilters = validateData(medicalRecordFiltersSchema, 'query');
export const validateProductFilters = validateData(productFiltersSchema, 'query');
export const validateStockMovementFilters = validateData(stockMovementFiltersSchema, 'query');
export const validatePagination = validateData(paginationSchema, 'query');

// Middleware para validar UUID
export const validateUUID = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(value)) {
      return res.status(400).json({
        error: `${paramName} deve ser um UUID válido`
      });
    }
    
    next();
  };
};

// Middleware para validar múltiplos UUIDs
export const validateMultiple = (schema: Joi.ObjectSchema, source: 'body' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === 'body' ? req.body : req.query;
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      logger.warn('Erro de validação:', { errors, data });
      
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors
      });
    }
    
    next();
  };
};

// Função utilitária para criar middlewares de validação
function validateData(schema: Joi.ObjectSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === 'body' ? req.body : req.query;
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      logger.warn('Erro de validação:', { errors, data });
      
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors
      });
    }
    
    // Substituir os dados validados
    if (source === 'body') {
      req.body = value;
    } else {
      req.query = value;
    }
    
    next();
  };
}

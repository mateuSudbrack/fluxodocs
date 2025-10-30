import React, { useState } from 'react';
import type { Supplier } from '../types';
import { Button } from './Button';
import { SupplierForm } from './SupplierForm';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

interface SupplierManagementProps {
  suppliers: Supplier[];
  onSave: (supplier: Supplier) => void;
  onDelete: (supplierId: string) => void;
}

export const SupplierManagement: React.FC<SupplierManagementProps> = ({ suppliers, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleOpenNewModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };
  
  const handleSave = (data: Omit<Supplier, 'id'>) => {
    onSave({
      id: editingSupplier?.id || crypto.randomUUID(),
      ...data,
    });
    handleCloseModal();
  };

  return (
    <>
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-teal-400">Gerenciar Fornecedores</h2>
          <Button onClick={handleOpenNewModal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Fornecedor
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
              <tr>
                <th scope="col" className="px-4 py-3">Nome do Fornecedor</th>
                <th scope="col" className="px-4 py-3">Código</th>
                <th scope="col" className="px-4 py-3">CNPJ/CPF</th>
                <th scope="col" className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Nenhum fornecedor cadastrado.
                  </td>
                </tr>
              ) : (
                suppliers.map(supplier => (
                  <tr key={supplier.id} className="border-b border-gray-700 hover:bg-gray-700/40">
                    <td className="px-4 py-3 font-medium truncate max-w-xs">{supplier.nomeFornecedor}</td>
                    <td className="px-4 py-3">{supplier.codigoFornecedor}</td>
                    <td className="px-4 py-3">{supplier.CNPJ_FORNECEDOR}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button onClick={() => handleOpenEditModal(supplier)} variant="secondary" className="p-2" title="Editar Fornecedor">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => onDelete(supplier.id)} variant="secondary" className="p-2 hover:bg-red-500/20 hover:text-red-400" title="Excluir Fornecedor">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <SupplierForm
                onSave={handleSave}
                onCancel={handleCloseModal}
                initialData={editingSupplier ?? undefined}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

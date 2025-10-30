import React from 'react';
import type { SaaProject } from '../types';
import { Button } from './Button';
import { PlusCircle, Trash2, FolderKanban } from 'lucide-react';

interface ProjectListProps {
  projects: SaaProject[];
  selectedProjectId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, selectedProjectId, onSelect, onDelete, onAddNew }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-teal-400">Projetos</h2>
        <Button onClick={onAddNew} className="py-2 px-3">
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo
        </Button>
      </div>
      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
        {projects.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum projeto adicionado.</p>
        ) : (
          projects.map((project) => {
            const totalPayments = project.monthlyControls.reduce((acc, control) => acc + control.payments.length, 0);
            return (
              <div
                key={project.id}
                onClick={() => onSelect(project.id)}
                className={`p-3 rounded-md cursor-pointer transition-all duration-200 flex justify-between items-start group ${
                  selectedProjectId === project.id
                    ? 'bg-teal-600/30 ring-2 ring-teal-500'
                    : 'bg-gray-700 hover:bg-gray-600/80'
                }`}
              >
                <div className="flex items-center overflow-hidden">
                   <FolderKanban className={`h-5 w-5 mr-3 flex-shrink-0 ${selectedProjectId === project.id ? 'text-teal-400' : 'text-gray-400'}`} />
                   <div className="overflow-hidden">
                      <p className={`font-semibold truncate ${selectedProjectId === project.id ? 'text-teal-300' : 'text-gray-200'}`}>
                          {project.tituloProjeto || 'Projeto sem título'}
                      </p>
                      <p className="text-sm text-gray-400">{totalPayments} pagamento(s)</p>
                   </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  title="Excluir projeto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { ProjectList } from './components/ProjectList';
import { ProjectView } from './components/ProjectView';
import { SaaForm as ProjectForm } from './components/SaaForm';
import { SupplierManagement } from './components/SupplierManagement';
import { TemplateManagement } from './components/TemplateManagement';
import { FilePlus2, FolderKanban, Users, FileText } from 'lucide-react';
import type { SaaProject, SaaPayment, Supplier, MonthlyControl, Template, FinancialData } from './types';

const initialFinancialData: FinancialData = {
  periodoDe: '',
  periodoAte: '',
  totalAprovado: '',
  parcelaRecebida: '',
  saldoParcelaAnterior: '',
  rendimentosAplicacao: '',
  doacao: '',
  emprestimos: '',
  devolucaoCredito: '',
  doacaoRede: '',
  resgates: '',
  taxasBancarias: '',
  estornos: '',
  aplicacaoFinanceira: '',
  pagamentoIndevido: '',
  saldoBancario: '',
  saldoAplicacao: '',
  dataExtrato: '',
};

const App: React.FC = () => {
  // State
  const [projects, setProjects] = useState<SaaProject[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentProjectView, setCurrentProjectView] = useState<'view' | 'add_project' | 'edit_project'>('view');
  const [activeView, setActiveView] = useState<'projects' | 'suppliers' | 'templates'>('projects');
  
  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId), 
    [projects, selectedProjectId]
  );

  // Project Handlers
  const handleAddNewProject = () => {
    setSelectedProjectId(null);
    setCurrentProjectView('add_project');
  };
  
  const handleEditProject = (project: SaaProject) => {
    setSelectedProjectId(project.id);
    setCurrentProjectView('edit_project');
  };
  
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentProjectView('view');
  };

  const handleSaveProject = (projectData: Omit<SaaProject, 'id' | 'monthlyControls'>) => {
    if (currentProjectView === 'edit_project' && selectedProjectId) {
      setProjects(prev => 
        prev.map(p => p.id === selectedProjectId ? { ...p, ...projectData } : p)
      );
    } else {
      const newProject: SaaProject = {
        id: crypto.randomUUID(),
        ...projectData,
        monthlyControls: []
      };
      setProjects(prev => [...prev, newProject]);
      setSelectedProjectId(newProject.id);
    }
    setCurrentProjectView('view');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setCurrentProjectView('view');
    }
  };
  
  const handleCancelProject = () => {
    setCurrentProjectView('view');
  };

  // Monthly Control Handlers
  const handleAddMonthlyControl = (projectId: string, name: string) => {
    const newControl: MonthlyControl = { 
      id: crypto.randomUUID(), 
      name, 
      payments: [],
      financials: { ...initialFinancialData }
    };
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, monthlyControls: [...p.monthlyControls, newControl] } : p
    ));
  };

  const handleDeleteMonthlyControl = (projectId: string, controlId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, monthlyControls: p.monthlyControls.filter(mc => mc.id !== controlId) } : p
    ));
  };

  // Payment Handlers
  const handleSavePayment = (projectId: string, controlId: string, payment: SaaPayment, newSupplierData?: Omit<Supplier, 'id'>) => {
    // If new supplier data is provided, add it to the main list if it doesn't exist
    if (newSupplierData?.CNPJ_FORNECEDOR) {
      const supplierExists = suppliers.some(s => s.CNPJ_FORNECEDOR === newSupplierData.CNPJ_FORNECEDOR);
      if (!supplierExists) {
        const newSupplier: Supplier = {
          id: crypto.randomUUID(),
          ...newSupplierData
        };
        setSuppliers(prev => [...prev, newSupplier]);
      }
    }
    
    // Save the payment to the project
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          monthlyControls: p.monthlyControls.map(mc => {
            if (mc.id === controlId) {
              const paymentExists = mc.payments.some(pay => pay.id === payment.id);
              if (paymentExists) {
                return { ...mc, payments: mc.payments.map(pay => pay.id === payment.id ? payment : pay) };
              } else {
                return { ...mc, payments: [...mc.payments, payment] };
              }
            }
            return mc;
          })
        };
      }
      return p;
    }));
  };
  
  const handleDeletePayment = (projectId: string, controlId: string, paymentId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          monthlyControls: p.monthlyControls.map(mc => 
            mc.id === controlId ? { ...mc, payments: mc.payments.filter(pay => pay.id !== paymentId) } : mc
          )
        };
      }
      return p;
    }));
  };
  
  // Financials Handler
  const handleSaveFinancials = (projectId: string, controlId: string, data: FinancialData) => {
     setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          monthlyControls: p.monthlyControls.map(mc => 
            mc.id === controlId ? { ...mc, financials: data } : mc
          )
        };
      }
      return p;
    }));
  };


  // Supplier Handlers
  const handleSaveSupplier = (supplier: Supplier) => {
    const supplierExists = suppliers.some(s => s.id === supplier.id);
    if (supplierExists) {
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
    } else {
      setSuppliers(prev => [...prev, supplier]);
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  };

  // Template Handlers
  const handleAddTemplate = (file: File) => {
    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name: file.name,
      file: file,
    };
    setTemplates(prev => [...prev, newTemplate]);
  };
  
  const handleUpdateTemplate = (templateId: string, newFile: File) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, file: newFile, name: newFile.name } : t
    ));
  };


  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };


  // Render Logic
  const renderProjectRightPanel = () => {
    if (currentProjectView === 'add_project' || currentProjectView === 'edit_project') {
      return (
        <ProjectForm 
          onSave={handleSaveProject} 
          onCancel={handleCancelProject}
          initialData={currentProjectView === 'edit_project' ? selectedProject : undefined} 
        />
      );
    }
    
    if (selectedProject) {
      return (
        <ProjectView 
            project={selectedProject} 
            suppliers={suppliers}
            templates={templates}
            onEditProject={() => handleEditProject(selectedProject)}
            onAddMonthlyControl={handleAddMonthlyControl}
            onDeleteMonthlyControl={handleDeleteMonthlyControl}
            onSavePayment={handleSavePayment}
            onDeletePayment={handleDeletePayment}
            onSaveFinancials={handleSaveFinancials}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-gray-500 h-full bg-gray-800 rounded-lg min-h-[500px] lg:sticky lg:top-24">
        <FilePlus2 className="h-16 w-16" />
        <p className="mt-4 text-lg">Selecione um projeto ou adicione um novo.</p>
        <p className="text-sm">Os detalhes e pagamentos do projeto aparecerão aqui.</p>
      </div>
    );
  };
  
  const NavButton: React.FC<{
      label: string;
      isActive: boolean;
      onClick: () => void;
      icon: React.ElementType;
    }> = ({ label, isActive, onClick, icon: Icon }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-teal-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon className="h-5 w-5 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-teal-400">FluxoDocs</h1>
          <p className="text-gray-400">Gerencie seus projetos e gere documentos SAA instantaneamente.</p>
        </div>
      </header>
      
      <main className="container mx-auto max-w-7xl p-4 lg:p-6 mt-4">
        <nav className="mb-6 bg-gray-800 p-2 rounded-lg inline-flex items-center space-x-2">
            <NavButton label="Projetos" isActive={activeView === 'projects'} onClick={() => setActiveView('projects')} icon={FolderKanban} />
            <NavButton label="Fornecedores" isActive={activeView === 'suppliers'} onClick={() => setActiveView('suppliers')} icon={Users} />
            <NavButton label="Modelos" isActive={activeView === 'templates'} onClick={() => setActiveView('templates')} icon={FileText} />
        </nav>

        {activeView === 'projects' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <ProjectList
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelect={handleSelectProject}
                onDelete={handleDeleteProject}
                onAddNew={handleAddNewProject}
              />
            </div>
            <div className="lg:col-span-2">
              {renderProjectRightPanel()}
            </div>
          </div>
        )}
        
        {activeView === 'suppliers' && (
          <SupplierManagement 
            suppliers={suppliers}
            onSave={handleSaveSupplier}
            onDelete={handleDeleteSupplier}
          />
        )}

        {activeView === 'templates' && (
          <TemplateManagement
            templates={templates}
            onAdd={handleAddTemplate}
            onDelete={handleDeleteTemplate}
            onUpdate={handleUpdateTemplate}
          />
        )}
      </main>

      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
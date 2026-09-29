import React, { useState } from 'react';
import { ClientProfile } from '../types/invoice';
import { Users, Plus, Trash2, Edit2, X, Building, Search, Check } from 'lucide-react';

interface ClientDirectoryModalProps {
  clients: ClientProfile[];
  onSelectClient: (client: ClientProfile) => void;
  onSaveClient: (client: ClientProfile) => void;
  onDeleteClient: (name: string) => void;
  onClose: () => void;
}

export const ClientDirectoryModal: React.FC<ClientDirectoryModalProps> = ({
  clients,
  onSelectClient,
  onSaveClient,
  onDeleteClient,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<ClientProfile>>({
    name: '',
    address: '',
    gstin: '',
  });

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartAdd = () => {
    setCurrentClient({ name: '', address: '', gstin: '' });
    setIsEditing(true);
  };

  const handleStartEdit = (c: ClientProfile) => {
    setCurrentClient(c);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient.name || !currentClient.name.trim()) return;

    onSaveClient({
      id: currentClient.id || 'client_' + Date.now(),
      name: currentClient.name.trim(),
      address: currentClient.address || '',
      gstin: currentClient.gstin ? currentClient.gstin.trim().toUpperCase() : '',
    });

    setIsEditing(false);
    setCurrentClient({ name: '', address: '', gstin: '' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">
              Client / M/s. Directory ({clients.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEditing ? (
          /* EDIT / ADD FORM */
          <form onSubmit={handleSave} className="p-6 space-y-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
              {currentClient.id ? 'Edit Client Details' : 'Add New Client (M/s.)'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client / Company Name (M/s.) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={currentClient.name || ''}
                onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
                placeholder="e.g. BHARAT HEAVY ELECTRICALS LTD"
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={currentClient.gstin || ''}
                onChange={(e) => setCurrentClient({ ...currentClient, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 27AAAAA0000A1Z5"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Address & Factory Location
              </label>
              <textarea
                rows={3}
                value={currentClient.address || ''}
                onChange={(e) => setCurrentClient({ ...currentClient, address: e.target.value })}
                placeholder="e.g. Plot No 12, Industrial Area, Chakan, Pune"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Save Client
              </button>
            </div>
          </form>
        ) : (
          /* CLIENT LIST VIEW */
          <>
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search client names, GSTIN or address..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleStartAdd}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-1 shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  {searchTerm ? 'No clients match your query.' : 'No clients saved yet.'}
                </div>
              ) : (
                filtered.map((client) => (
                  <div
                    key={client.id || client.name}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-lg flex items-start justify-between transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 rounded-lg mt-0.5">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{client.name}</h4>
                        {client.address && (
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                            {client.address}
                          </p>
                        )}
                        {client.gstin && (
                          <span className="inline-block mt-1 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            GSTIN: {client.gstin}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectClient(client);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use on Bill</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(client)}
                        title="Edit client"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete client ${client.name}?`)) {
                            onDeleteClient(client.name);
                          }
                        }}
                        title="Delete client"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

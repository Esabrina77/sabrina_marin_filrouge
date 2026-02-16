"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import UserService from '@/lib/api/users';
import { User as UserType, UserRequest, Role } from '@/types/user';

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<UserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: Role.CLIENT
  });

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserService.getAll({
        page: currentPage,
        size: 10,
        sort: 'createdAt,desc'
      });
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Handle Modal Open/Close
  const openModal = (user?: UserType) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        password: '' // Don't fill password on edit
      });
    } else {
      setSelectedUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: Role.CLIENT
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Update
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password; // Don't send empty password
        await UserService.update(selectedUser.id, updateData);
      } else {
        // Create
        await UserService.create(formData);
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user', error);
      alert('Erreur lors de l\'enregistrement. Vérifiez les données.');
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      try {
        await UserService.delete(id);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  // Handle Role Promotion to Admin
  const handlePromote = async (id: string) => {
     if (confirm('Voulez-vous vraiment promouvoir cet utilisateur Administrateur ?')) {
        try {
           await UserService.setAdminRole(id);
           fetchUsers();
        } catch (error) {
           console.error('Failed to promote user', error);
        }
     }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500">Gérez les comptes clients et administrateurs.</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
             <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-400" />
             </div>
             <p className="text-gray-500 font-medium">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-400">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        user.role === Role.ADMIN 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {user.role !== Role.ADMIN && (
                            <button 
                              onClick={() => handlePromote(user.id)}
                              title="Promouvoir Admin"
                              className="p-2 hover:bg-purple-50 text-gray-400 hover:text-purple-500 rounded-lg transition-colors"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                         )}
                        <button 
                          onClick={() => openModal(user)}
                          className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Affichage de {users.length} sur {totalElements} utilisateurs
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" /> Précédent
              </Button>
              <Button 
                variant="outline" 
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                className="h-8 px-3 text-xs"
              >
                Suivant <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Prénom</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Nom</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
              <input
                required
                type="email"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-1 block">
                {selectedUser ? "Nouveau mot de passe (laisser vide pour conserver)" : "Mot de passe"}
              </label>
              <input
                required={!selectedUser}
                type="password"
                minLength={8}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-1 block">Rôle</label>
              <select
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
              >
                {Object.values(Role).map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={closeModal}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

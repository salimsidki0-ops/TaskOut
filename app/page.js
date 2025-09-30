"use client";
import React, { useState } from 'react';
import { Plus, X, MoreHorizontal, Star, Users, Menu, User, Archive } from 'lucide-react';

export default function TaskOut() {
  const [boards, setBoards] = useState([
    {
      id: 1,
      title: 'À faire',
      cards: [
        { id: 1, title: 'Créer la maquette du site', description: 'Design sur Figma', team: 'Design', assignedUsers: ['Salim', 'Youssef'], archived: false,createdAt: '2025-07-30T09:00:00.000Z', deadline: '2025-10-10' },
        { id: 2, title: 'Configurer le projet', description: 'Next.js + Tailwind', team: 'Développement', assignedUsers: ['Mehdi'], archived: false,createdAt: '2025-09-30T09:00:00.000Z', deadline: '2025-10-10' },
      ]
    },
    {
      id: 2,
      title: 'En cours',
      cards: [
        { id: 3, title: 'Développer les composants', description: 'React components', team: 'Développement', assignedUsers: ['Salim'], archived: false,createdAt: '2025-08-30T09:00:00.000Z', deadline: '2025-10-10' },
      ]
    },
    {
      id: 3,
      title: 'Terminé',
      cards: [
        { id: 4, title: 'Installer les dépendances', description: 'npm install', team: 'Développement', assignedUsers: ['Youssef', 'Mehdi'], archived: false,createdAt: '2025-09-20T09:00:00.000Z', deadline: '2025-10-10' },
      ]
    },
  ]);


  // Available teams and users
  const teams = ['Design', 'Développement', 'Marketing', 'Support'];
  const allUsers = ['Salim', 'Mehdi', 'Youssef', 'Zakaria', 'Hamza', 'Achraf'];

  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedFromList, setDraggedFromList] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  
  // Modal states
  const [editCard, setEditCard] = useState(null);
  const isEditing = !!editCard;
  const [showModal, setShowModal] = useState(false);
  const [modalListId, setModalListId] = useState(null);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    team: '',
    assignedUsers: [],
    document: null,
    deadline: ''
  });

  function getProgress(card) {
    if (!card.createdAt || !card.deadline) return 0;
    const created = new Date(card.createdAt);
    const deadline = new Date(card.deadline);
    const now = new Date();

    const total = deadline - created;
    const elapsed = now - created;
    if (total <= 0) return 100;
    let percent = Math.round((elapsed / total) * 100);
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    return percent;
  }

  function getProgressColor(percent) {
  // Bleu: rgb(59, 130, 246) (#3b82f6)
  // Rouge: rgb(239, 68, 68) (#ef4444)
  const r = Math.round(59 + (239 - 59) * (percent / 100));
  const g = Math.round(130 + (68 - 130) * (percent / 100));
  const b = Math.round(246 + (68 - 246) * (percent / 100));
  return `rgb(${r},${g},${b})`;
}

  // Drag and Drop handlers
  const handleDragStart = (card, listId) => {
    setDraggedCard(card);
    setDraggedFromList(listId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetListId) => {
  if (!draggedCard || !draggedFromList) return;

  // Si on drop dans la même liste, ne rien faire
  if (draggedFromList === targetListId) {
    setDraggedCard(null);
    setDraggedFromList(null);
    return;
  }

  setBoards(prevBoards =>
    prevBoards.map(board => {
      // Si c'est la liste source, on retire la carte
      if (board.id === draggedFromList) {
        return {
          ...board,
          cards: board.cards.filter(c => c.id !== draggedCard.id)
        };
      }
      // Si c'est la liste cible, on ajoute une copie de la carte
      if (board.id === targetListId) {
        return {
          ...board,
          cards: [...board.cards, { ...draggedCard }]
        };
      }
      // Sinon, on ne change rien
      return board;
    })
  );

  setDraggedCard(null);
  setDraggedFromList(null);
  };

  // Add new list
  const handleAddList = () => {
    if (!newListTitle.trim()) return;
    
    const newList = {
      id: Date.now(),
      title: newListTitle,
      cards: []
    };
    
    setBoards([...boards, newList]);
    setNewListTitle('');
    setIsAddingList(false);
  };

  // Open modal for adding card
  const openAddCardModal = (listId) => {
    setModalListId(listId);
    setShowModal(true);
    setNewCard({
      title: '',
      description: '',
      team: '',
      assignedUsers: [],
      document: null,
      deadline: ''
    });
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalListId(null);
    setNewCard({
      title: '',
      description: '',
      team: '',
      assignedUsers: [],
      document: null,
      deadline: ''
    });
  };

  // Toggle user selection
  const toggleUserSelection = (user) => {
    setNewCard(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(user)
        ? prev.assignedUsers.filter(u => u !== user)
        : [...prev.assignedUsers, user]
    }));
  };
  
  const handleSaveCard = () => {
    if (!newCard.title.trim()) {
      alert('Le titre est obligatoire !');
      return;
    }
    if (!newCard.deadline) {
      alert('La deadline est obligatoire !');
      return;
    }

    // Vérification deadline >= date de création
    const creationDate = isEditing && editCard.createdAt
      ? new Date(editCard.createdAt)
      : new Date();
    const deadlineDate = new Date(newCard.deadline);

    if (deadlineDate < creationDate) {
      alert("La deadline ne peut pas être antérieure à la date de création !");
      return;
    }

    if (isEditing) {
      // Modifier la carte existante
      setBoards(prevBoards =>
        prevBoards.map(board =>
          board.id === modalListId
            ? {
                ...board,
                cards: board.cards.map(card =>
                  card.id === editCard.id
                    ? { ...card, ...newCard }
                    : card
                )
              }
            : board
        )
      );
      setEditCard(null);
    } else {
      // Ajouter une nouvelle carte
      const card = {
        id: `${Date.now()}-${Math.random()}`,
        title: newCard.title,
        description: newCard.description,
        team: newCard.team,
        assignedUsers: newCard.assignedUsers,
        document: newCard.document,
        archived: false,
        createdAt: creationDate.toISOString(),
        deadline: newCard.deadline
      };

      setBoards(prevBoards =>
        prevBoards.map(board =>
          board.id === modalListId
            ? {
                ...board,
                cards: [...board.cards, card]
              }
            : board
        )
      );
    }

    closeModal();
  };

  // Delete card
  const handleDeleteCard = (listId, cardId) => {
    setBoards(prevBoards => {
      const newBoards = [...prevBoards];
      const list = newBoards.find(b => b.id === listId);
      list.cards = list.cards.filter(c => c.id !== cardId);
      return newBoards;
    });
  };

  // Delete list
  const handleDeleteList = (listId) => {
    setBoards(boards.filter(b => b.id !== listId));
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#a35f20" }}>
      {/* Header */}
      <header
      className="backdrop-blur-sm px-4 py-3"
  style={{ backgroundColor: "#070d23", opacity: 0.95 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Menu className="w-5 h-5 text-white cursor-pointer hover:bg-white hover:bg-opacity-20 rounded p-1" />
              <h1 className="text-white font-bold text-xl">TaskOut</h1>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <button className="px-3 py-1.5 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition font-medium">
                Tableaux
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition">
              <Users className="w-5 h-5 text-white" />
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium">
              Partager
            </button>
          </div>
        </div>
      </header>

      {/* Board Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-white font-bold text-2xl">Mon Projet Web</h2>
          <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition">
            <Star className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Board Lists */}
      <div className="px-4 pb-8 overflow-x-auto">
        <div className="flex gap-4 min-h-[calc(100vh-200px)]">
          {boards.map(board => (
            <div
              key={board.id}
              className="bg-gray-100 rounded-lg p-3 w-72 flex-shrink-0 h-fit"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(board.id)}
            >
              {/* List Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{board.title}</h3>
                <button 
                  onClick={() => handleDeleteList(board.id)}
                  className="p-1 hover:bg-gray-200 rounded transition"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-2 mb-2">
                {board.cards.filter(card => !card.archived).map(card => (
                  <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card, board.id)}
                  className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-800 flex-1">{card.title}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setModalListId(board.id);
                          setShowModal(true);
                          setEditCard(card);
                          setNewCard({
                            title: card.title,
                            description: card.description,
                            team: card.team,
                            assignedUsers: card.assignedUsers,
                            document: card.document || null
                          });
                        }}
                        className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition text-xs"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          setBoards(prevBoards =>
                            prevBoards.map(board =>
                              board.id === board.id
                                ? {
                                    ...board,
                                    cards: board.cards.map(c =>
                                      c.id === card.id ? { ...c, archived: true } : c
                                    )
                                  }
                                : board
                            )
                          );
                        }}
                        className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-100 rounded"
                      >
                        <Archive className="w-4 h-4 text-gray-500" />
                        <span className="sr-only">Archiver</span>
                      </button>
                    </div>
                  </div>
                    
                    {card.description && (
                      <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                    )}
                    {card.deadline && (
                      <p className="text-xs text-red-600 font-semibold mb-1">
                        Deadline : {new Date(card.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <div className="w-full bg-gray-200 rounded h-3 mb-2">
                      <div
                        className="h-3 rounded transition-all"
                        style={{
                          width: `${getProgress(card)}%`,
                          background: getProgressColor(getProgress(card))
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                    </p>
                    
                    {card.team && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                          {card.team}
                        </span>
                      </div>
                    )}
                    
                    {card.assignedUsers.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {card.assignedUsers.map(user => (
                          <div
                            key={user}
                            className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold"
                            title={user}
                          >
                            {user[0]}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Card Button */}
              <button
                onClick={() => openAddCardModal(board.id)}
                className="w-full text-left px-2 py-2 text-gray-700 hover:bg-gray-200 rounded transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une carte</span>
              </button>
            </div>
          ))}

          {/* Add List Button */}
          <div className="flex-shrink-0 w-72">
            {isAddingList ? (
              <div className="bg-gray-100 rounded-lg p-3">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Saisir le titre de la liste..."
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleAddList}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListTitle('');
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded transition"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="w-full text-left px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter une liste</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal for Adding Card */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-xl font-bold text-gray-800">{isEditing ? "Modifier la tâche" : "Créer une nouvelle tâche"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={handleSaveCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {isEditing ? "Enregistrer" : "Créer la tâche"}
              </button>
              {/* Modifier List Button */}
                 
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre de la tâche <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCard.title}
                  onChange={(e) => setNewCard({...newCard, title: e.target.value})}
                  placeholder="Ex: Développer la page d'accueil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard({...newCard, description: e.target.value})}
                  placeholder="Décrivez la tâche en détail..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Team Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Équipe visée
                </label>
                <select
                  value={newCard.team}
                  onChange={(e) => setNewCard({...newCard, team: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une équipe</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {/* Users Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assigner des utilisateurs
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {allUsers.map(user => (
                    <label
                      key={user}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newCard.assignedUsers.includes(user)}
                        onChange={() => toggleUserSelection(user)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {user[0]}
                        </div>
                        <span className="text-gray-700">{user}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Selected Users Preview */}
              {newCard.assignedUsers.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Utilisateurs sélectionnés ({newCard.assignedUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {newCard.assignedUsers.map(user => (
                      <span
                        key={user}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                      >
                        {user}
                        <button
                          onClick={() => toggleUserSelection(user)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Upload (Optional) */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    setNewCard(prev => ({ ...prev, document: file }));
                  }
                }}
                className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center mb-4 cursor-pointer bg-blue-50"
              >
                {newCard.document
                  ? <span className="text-blue-700">Document sélectionné : {newCard.document.name}</span>
                  : <span className="text-blue-700">Glissez-déposez un document ici ou cliquez pour choisir</span>
                }
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) setNewCard(prev => ({ ...prev, document: file }));
                  }}
                  ref={input => { if (input && !input.onclick) input.onclick = () => input.click(); }}
                />
              </div>
              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newCard.deadline}
                  onChange={e => setNewCard({ ...newCard, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {isEditing ? "Enregistrer" : "Créer la tâche"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
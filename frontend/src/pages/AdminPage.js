import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { radioAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPage = () => {
  const { isAuthenticated, login } = useAuth();
  const [loginToken, setLoginToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [radios, setRadios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRadio, setEditingRadio] = useState(null);
  const [generos, setGeneros] = useState([]);
  const [regioes, setRegioes] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    stream_url: '',
    genero: '',
    regiao: '',
    cidade: '',
    estado: '',
    endereco: '',
    telefone: '',
    redes_sociais: {
      facebook: '',
      instagram: '',
      tiktok: '',
      twitter: '',
      youtube: '',
      website: ''
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [radiosData, generosData, regioesData] = await Promise.all([
        radioAPI.getRadios({ ativo: null, limite: 100 }),
        radioAPI.getGeneros(),
        radioAPI.getRegioes()
      ]);
      setRadios(radiosData);
      setGeneros(generosData);
      setRegioes(regioesData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Test the token by trying to create a radio with minimal data
      const testData = {
        nome: 'TEST_RADIO_DELETE_ME',
        descricao: 'Test',
        stream_url: 'http://test.com',
        genero: 'Jornalismo',
        regiao: 'Sudeste',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      // Set token temporarily
      localStorage.setItem('admin_token', loginToken);
      
      // Try to create and immediately delete
      try {
        const createdRadio = await radioAPI.createRadio(testData);
        await radioAPI.deleteRadio(createdRadio.id);
        
        // If successful, login
        login(loginToken);
        toast.success('Login realizado com sucesso!');
      } catch (error) {
        localStorage.removeItem('admin_token');
        throw error;
      }
    } catch (error) {
      toast.error('Token inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        redes_sociais: Object.keys(formData.redes_sociais).reduce((acc, key) => {
          if (formData.redes_sociais[key]) {
            acc[key] = formData.redes_sociais[key];
          }
          return acc;
        }, {})
      };

      if (editingRadio) {
        await radioAPI.updateRadio(editingRadio.id, submitData);
        toast.success('Rádio atualizada com sucesso!');
      } else {
        await radioAPI.createRadio(submitData);
        toast.success('Rádio criada com sucesso!');
      }

      setShowForm(false);
      setEditingRadio(null);
      resetForm();
      loadAdminData();
    } catch (error) {
      toast.error('Erro ao salvar rádio');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (radio) => {
    setEditingRadio(radio);
    setFormData({
      nome: radio.nome,
      descricao: radio.descricao,
      stream_url: radio.stream_url,
      genero: radio.genero,
      regiao: radio.regiao,
      cidade: radio.cidade,
      estado: radio.estado,
      endereco: radio.endereco || '',
      telefone: radio.telefone || '',
      redes_sociais: radio.redes_sociais || {
        facebook: '',
        instagram: '',
        tiktok: '',
        twitter: '',
        youtube: '',
        website: ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (radio) => {
    if (window.confirm(`Tem certeza que deseja deletar a rádio "${radio.nome}"?`)) {
      try {
        await radioAPI.deleteRadio(radio.id);
        toast.success('Rádio deletada com sucesso!');
        loadAdminData();
      } catch (error) {
        toast.error('Erro ao deletar rádio');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      stream_url: '',
      genero: '',
      regiao: '',
      cidade: '',
      estado: '',
      endereco: '',
      telefone: '',
      redes_sociais: {
        facebook: '',
        instagram: '',
        tiktok: '',
        twitter: '',
        youtube: '',
        website: ''
      }
    });
  };

  const uploadRadioLogo = async (radioId, file) => {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos de imagem são permitidos (JPEG, PNG, GIF, WebP)');
        return false;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('O arquivo é muito grande. Tamanho máximo: 5MB');
        return false;
      }

      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Token de administrador necessário');
        return false;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/logo/${radioId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Logo da rádio atualizado com sucesso!');
        await loadAdminData(); // Recarregar dados
        return true;
      } else {
        let errorMessage = 'Erro ao fazer upload do logo';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        
        console.error('Upload error:', response.status, errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      return false;
    }
  };

  const handleLogoUpload = async (radioId, event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingLogo(true);
      try {
        await uploadRadioLogo(radioId, file);
        // Clear the file input after upload
        event.target.value = '';
      } catch (error) {
        console.error('Error uploading logo:', error);
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              <span className="text-cyan-600">mobina</span><span className="text-gray-900">bert</span> <span className="text-cyan-500">PLAY</span>
            </h1>
            <p className="text-gray-600">Área Administrativa</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de Administrador
              </label>
              <input
                type="password"
                value={loginToken}
                onChange={(e) => setLoginToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Digite o token de admin"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Validando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Token padrão: <code className="bg-gray-100 px-2 py-1 rounded text-cyan-600">admin-radio-token-2025</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-cyan-600">mobina</span><span className="text-gray-900">bert</span> <span className="text-cyan-500">PLAY</span>
          </h1>
          <p className="text-gray-600 mt-1">Administração de Rádios</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingRadio(null);
            resetForm();
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
        >
          + Nova Rádio
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingRadio ? 'Editar Rádio' : 'Nova Rádio'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Rádio *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Stream *
                  </label>
                  <input
                    type="url"
                    value={formData.stream_url}
                    onChange={(e) => handleInputChange('stream_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gênero *
                  </label>
                  <select
                    value={formData.genero}
                    onChange={(e) => handleInputChange('genero', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="">Selecione um gênero</option>
                    {generos.map(genero => (
                      <option key={genero.value} value={genero.value}>
                        {genero.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Região *
                  </label>
                  <select
                    value={formData.regiao}
                    onChange={(e) => handleInputChange('regiao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="">Selecione uma região</option>
                    {regioes.map(regiao => (
                      <option key={regiao.value} value={regiao.value}>
                        {regiao.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex: SP"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Redes Sociais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.redes_sociais.facebook}
                      onChange={(e) => handleInputChange('redes_sociais.facebook', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.redes_sociais.instagram}
                      onChange={(e) => handleInputChange('redes_sociais.instagram', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.redes_sociais.website}
                      onChange={(e) => handleInputChange('redes_sociais.website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={formData.redes_sociais.youtube}
                      onChange={(e) => handleInputChange('redes_sociais.youtube', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Radios List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Rádios Cadastradas ({radios.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gênero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {radios.map((radio) => (
                <tr key={radio.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{radio.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                      {radio.genero}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {radio.cidade}, {radio.estado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      radio.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {radio.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(radio)}
                      className="text-cyan-600 hover:text-cyan-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(radio)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
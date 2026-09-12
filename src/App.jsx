import React, { useState, useEffect } from 'react';

export default function App() {
  // Estados do Formulário
  const [companyName, setCompanyName] = useState('');
  const [freightValue, setFreightValue] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [tollCost, setTollCost] = useState('');
  const [otherExpenses, setOtherExpenses] = useState('');
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Estados de Dados e Busca
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState([]);
  const [monthlyGoal, setMonthlyGoal] = useState('15000');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Compactador de imagem embutido (gera WebP leve)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/webp', 0.65);
        setReceiptPhoto(compressedDataUrl);
        setPhotoPreview(compressedDataUrl);
      };
    };
  };

  // Cálculos automáticos do formulário atual
  const freight = parseFloat(freightValue) || 0;
  const fuel = parseFloat(fuelCost) || 0;
  const toll = parseFloat(tollCost) || 0;
  const others = parseFloat(otherExpenses) || 0;
  const totalExpenses = fuel + toll + others;
  const currentNetProfit = freight - totalExpenses;

  // Lançar nova saída
  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!companyName || !freightValue) {
      alert('Por favor, preencha pelo menos a Empresa e o Valor do Frete.');
      return;
    }

    const newTrip = {
      id: Date.now(),
      companyName,
      freightValue: freight,
      fuelCost: fuel,
      tollCost: toll,
      otherExpenses: others,
      netProfit: currentNetProfit,
      receiptPhoto: photoPreview,
      tripDate,
    };

    setTrips([newTrip, ...trips]);

    // Limpar formulário
    setCompanyName('');
    setFreightValue('');
    setFuelCost('');
    setTollCost('');
    setOtherExpenses('');
    setReceiptPhoto(null);
    setPhotoPreview(null);
  };

  // Cálculos de Totais Acumulados
  const totalProfitAcquired = trips.reduce((acc, trip) => acc + trip.netProfit, 0);
  const goalTarget = parseFloat(monthlyGoal) || 1;
  const goalProgressPercentage = Math.min(Math.round((totalProfitAcquired / goalTarget) * 100), 100);

  // Filtragem por Busca de Empresa
  const filteredTrips = trips.filter((trip) =>
    trip.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 pb-12">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <!-- Cabeçalho Principal -->
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-sky-500 tracking-tight flex items-center gap-2">
              🚚 RodagemPro
            </h1>
            <p className="text-xs text-slate-400">Controle de Saídas & Lucro Real</p>
          </div>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="bg-slate-900 border border-slate-700 hover:border-sky-500 text-sky-400 text-xs px-3 py-2 rounded-xl transition"
          >
            🎯 Meta: R$ {parseFloat(monthlyGoal).toLocaleString('pt-BR')}
          </button>
        </header>

        <!-- Card de Progresso da Meta -->
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Progresso da Meta Mensal</span>
            <span className="font-bold text-sky-400">{goalProgressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${goalProgressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Acumulado: <strong className="text-emerald-400">R$ {totalProfitAcquired.toFixed(2)}</strong></span>
            <span>Meta: <strong>R$ {goalTarget.toFixed(2)}</strong></span>
          </div>
        </div>

        <!-- Formulário de Lançamento -->
        <form onSubmit={handleAddTrip} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
            ➕ Nova Saída / Frete
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Empresa / Cliente</label>
              <input
                type="text"
                placeholder="Ex: Transportadora X"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm focus:border-sky-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Data</label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm focus:border-sky-500 outline-none text-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-emerald-400 mb-1">Valor Frete (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={freightValue}
                onChange={(e) => setFreightValue(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-900/40 rounded-xl p-2.5 text-sm text-emerald-400 font-semibold focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-rose-400 mb-1">Combustível (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                className="w-full bg-slate-950 border border-rose-900/40 rounded-xl p-2.5 text-sm text-rose-400 font-semibold focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-rose-400 mb-1">Pedágio (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={tollCost}
                onChange={(e) => setTollCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-rose-400 mb-1">Outras Despesas (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <!-- Foto da Nota Fiscal -->
          <div>
            <label className="block text-xs text-slate-400 mb-1">Foto da Nota Fiscal (Comprimida)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
            />
            {photoPreview && (
              <div className="mt-2 flex items-center gap-3">
                <img src={photoPreview} alt="Comprovante" className="w-14 h-14 object-cover rounded-lg border border-slate-700" />
                <span className="text-xs text-emerald-400">✓ Imagem compactada em WebP</span>
              </div>
            )}
          </div>

          <!-- Lucro Real Calculado na Hora -->
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
            <span className="text-xs text-slate-400">Lucro Real Estimado:</span>
            <span className={`text-base font-extrabold ${currentNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              R$ {currentNetProfit.toFixed(2)}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold p-3 rounded-xl shadow-lg transition duration-200"
          >
            Salvar Saída
          </button>
        </form>

        <!-- Busca por Empresa -->
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-300">Histórico de Saídas</h3>
            <span className="text-xs text-slate-500">{filteredTrips.length} registros</span>
          </div>

          <input
            type="text"
            placeholder="🔍 Buscar por nome da empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"
          />

          <!-- Lista de Registros -->
          <div className="space-y-3">
            {filteredTrips.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-center text-slate-500 text-sm">
                Nenhum registro encontrado.
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <div key={trip.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-200 text-base">{trip.companyName}</h4>
                    <p className="text-xs text-slate-400">{trip.tripDate}</p>
                    <div className="text-xs text-slate-400 space-x-2 pt-1">
                      <span>Frete: <strong className="text-slate-200">R$ {trip.freightValue.toFixed(2)}</strong></span>
                      <span>|</span>
                      <span>Gastos: <strong className="text-rose-400">R$ {(trip.fuelCost + trip.tollCost + trip.otherExpenses).toFixed(2)}</strong></span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="block text-xs text-slate-400">Lucro Real</span>
                    <span className="block text-base font-black text-emerald-400">
                      R$ {trip.netProfit.toFixed(2)}
                    </span>
                    {trip.receiptPhoto && (
                      <a href={trip.receiptPhoto} target="_blank" rel="noreferrer" className="inline-block text-[10px] text-sky-400 underline">
                        Ver Comprovante
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <!-- Modal de Alteração de Meta -->
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Definir Meta Mensal</h3>
            <input
              type="number"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-bold outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold px-4 py-2 rounded-xl"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

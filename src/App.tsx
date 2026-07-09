
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import BlocksPage from '@/pages/BlocksPage';
import BlockPage from '@/pages/BlockPage';
import TransactionPage from '@/pages/TransactionPage';
import TransactionsPage from '@/pages/TransactionsPage';
import AddressPage from '@/pages/AddressPage';
import NodesPage from '@/pages/NodesPage';
import ContractPage from '@/pages/ContractPage';
import ContractsPage from '@/pages/ContractsPage';
import ConverterPage from '@/pages/ConverterPage';
import FaucetPage from '@/pages/FaucetPage';
import CarbonMapPage from '@/pages/CarbonMapPage';
import RankingPage from '@/pages/RankingPage';
import ValidatorsPage from '@/pages/ValidatorsPage';
import NotFound from '@/pages/NotFound';
import AssetPage from '@/pages/AssetPage';
import TokenPlanetPage from '@/pages/TokenPlanetPage';
import TokenRedirect from '@/components/TokenRedirect';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="blocks" element={<BlocksPage />} />
            <Route path="block/:height" element={<BlockPage />} />
            <Route path="tx/:id" element={<TransactionPage />} />
            <Route path="transaction/:id" element={<TransactionPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="address/:address" element={<AddressPage />} />
            <Route path="nodes" element={<NodesPage />} />
            <Route path="charts" element={<Navigate to="/nodes" replace />} />
            <Route path="contract/:address" element={<ContractPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="address-converter" element={<ConverterPage />} />
            <Route path="faucet" element={<FaucetPage />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="validators" element={<ValidatorsPage />} />
            <Route path="carbon-map" element={<CarbonMapPage />} />
            <Route path="tokenplanet/VERDE" element={<TokenPlanetPage />} />
            <Route path="token/:id" element={<TokenRedirect />} />
            <Route path="asset/:id" element={<AssetPage />} />
            <Route path="assets/:id" element={<AssetPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
      <SonnerToaster position="top-right" closeButton />
    </ThemeProvider>
  );
}

export default App;
